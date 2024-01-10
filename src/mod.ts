import { DependencyContainer, inject, injectable } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
declare const process: any; // Declare process globally with any type

import * as fs from 'fs';
import * as path from 'path';

@injectable()
class Mod implements IPostDBLoadMod {
    /////CONFIG PART
    private static readonly RNG_SEED: number = 69420; //CHANGE THIS NUMBER for a different random seed :) You can even share them with friends!
    private static readonly RNG_A: number = 1664525; //Keep this number 1664525
    private static readonly RNG_C: number = 1013904223; //Keep this number 1013904223
    private static readonly RNG_M: number = Math.pow(2, 32);
    private static readonly NIGHT_VISION_SAVE_KEY: string = "570fd79bd2720bc7458b4583";
    private static readonly FOLDER_RELATIVE_PATH: string = 'AppData\\Local\\Temp\\Battlestate Games\\EscapeFromTarkov'; //This is to remove the cached pictures for each restart, so you see the weapons correctly in the preview.
    public postDBLoad(c: DependencyContainer): void {
        const MAX_ATTEMPTS: number = 5000;
        const PROCESS_COUNT_INTERVAL: number = 100;
        const EXCLUDED_ID: string = "5a2c3a9486f774688b05e574";
        const CARTRIDGE_MULTIPLIER_MAX: number = 30; //Maximum multiplier for magazines. 
        const VALUE_RANGE_MIN: number = 0.04;
        const DIFFERENT_FOLDERS_ALLOW: number = 1; //Decides how many folders can be different for the models. Higher number -> crazier results. 
        const ALLOW_MOD_RANDOMIZATION = false; //Enabling this allows a very, VERY strong randomization. 
        const ALLOW_EVERYTHING_WITH_EVERYTHING = false; //Very buggy, bots won't spawn. But its fun. 
        const fieldConfigurations = {
            'Ergonomics': { isFloat: false, canBeNegative: true, maxMultiplier: 5 },
            'ExamineExperience': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'ExamineTime': { isFloat: false, canBeNegative: false, maxMultiplier: 5 },
            'LootExperience': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'MaxDurability': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'RecoilAngle': { isFloat: false, canBeNegative: false, maxMultiplier: 3 },
            'StackMaxSize': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'Weight': { isFloat: true, canBeNegative: false, maxMultiplier: 1 },
            'bFirerate': { isFloat: false, canBeNegative: false, maxMultiplier: 10 },
            'ArmorDamage': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'BulletMassGram': { isFloat: true, canBeNegative: false, maxMultiplier: 25 },
            'ExplosionStrength': { isFloat: false, canBeNegative: false, maxMultiplier: 4 },
            'FragmentsCount': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'HeavyBleedingDelta': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'InitialSpeed': { isFloat: false, canBeNegative: false, maxMultiplier: 3 },
            'MaxExplosionDistance': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'MaxFragmentsCount': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'PenetrationPower': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'ProjectileCount': { isFloat: false, canBeNegative: false, maxMultiplier: 5, minValue: 1 },
            'buckshotBullets': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'MaxHpResource': { isFloat: false, canBeNegative: false, maxMultiplier: 25 },
            'Height': { isFloat: false, canBeNegative: false, maxMultiplier: 2, minValue: 1, maxValue: 3 },
            'Width': { isFloat: false, canBeNegative: false, maxMultiplier: 2, minValue: 1, maxValue: 3 },
            'medUseTime': { isFloat: false, canBeNegative: false, maxMultiplier: 3 },
            'CameraRecoil': { isFloat: true, canBeNegative: false, maxMultiplier: 2 }
        };

        ////CONFIG END


        const db = c.resolve<DatabaseServer>("DatabaseServer").getTables().templates.items;

        class SeededRNG {
            private seed: number;

            constructor(seed: number = Mod.RNG_SEED) {
                this.seed = seed;
            }

            random() {
                this.seed = (Mod.RNG_A * this.seed + Mod.RNG_C) % Mod.RNG_M;
                return this.seed / Mod.RNG_M;
            }
        }
        const rng = new SeededRNG();


        function exchangePrefabPath(db: any) {
            const keys = Object.keys(db);
            let processedCount = 0;
            const nightvisionsave = JSON.stringify(db[Mod.NIGHT_VISION_SAVE_KEY]);
            keys.forEach(key => {
                const item = db[key];
                if (item._type !== "Item" || !item._props || !item._props.Prefab || !item._props.Prefab.path || item._props.Prefab.path.includes("recievers") || item._props.Prefab.path.includes("weapons")) {
                    return; // Skip non-valid entries
                }
                const originalParent = db[key]._parent;
                const originalPath = db[key]._props.Prefab.path;
                const hasModBarrel = hasSlot(db[key], "mod_barrel");
                const isMod = originalPath.includes("/mods/");
                let newPath = "";
                let attempts = 0;

                do {
                    const randomKey = keys[Math.floor(rng.random() * keys.length)];
                    const randomItem = db[randomKey];
                    if (randomItem && randomItem._parent === originalParent &&
            randomItem._props && randomItem._props.Prefab && randomItem._props.Prefab.path //&&
                    // hasModBarrel === hasSlot(randomItem, "mod_barrel")
                    // &&
                    // hasSlot(db[key], "mod_nvg") === hasSlot(randomItem, "mod_nvg")
                    ) {
                        newPath = randomItem._props.Prefab.path;
                        if (newPath !== originalPath && isPathValid(originalPath, newPath, isMod)) {
                            break;
                        }
                    }

                    attempts++;
                    if (attempts > MAX_ATTEMPTS) {
                        //console.log(`Aborted attempt to find a new path for key ${key} after ${attempts} tries.`);
                        break;
                    }
                } while (true);

                if (attempts <= MAX_ATTEMPTS) {
                    db[key]._props.Prefab.path = newPath;
                }

                processedCount++;
                if (processedCount % PROCESS_COUNT_INTERVAL === 0) {
                    console.log(`Processed ${processedCount}/${keys.length} entries.`);
                }
            });
            db[Mod.NIGHT_VISION_SAVE_KEY] = JSON.parse(nightvisionsave);

        }
        function hasSlot(item: any, slotName: string): boolean {
            if (!item._props || !item._props.Slots) {
                return false;
            }
            return item._props.Slots.some((slot: any) => slot._name === slotName);
        }
        function isPathValid(originalPath: string, newPath: string, isMod: boolean): boolean {
            const originalDirs = originalPath.split('/').slice(0, -1);
            const newDirs = newPath.split('/').slice(0, -1);
            if (ALLOW_MOD_RANDOMIZATION) {
                return (originalDirs.slice(0, -DIFFERENT_FOLDERS_ALLOW - 1).join('/') === newDirs.slice(0, -DIFFERENT_FOLDERS_ALLOW - 1).join('/'));
            }
            else {
                return isMod ? (originalDirs.join('/') === newDirs.join('/'))
                    : (originalDirs.slice(0, -DIFFERENT_FOLDERS_ALLOW - 1).join('/') === newDirs.slice(0, -DIFFERENT_FOLDERS_ALLOW - 1).join('/'));
            }
        }



        function updateSlotFilters(weapons) {
            const excludedId = EXCLUDED_ID; // ID to be excluded from filters

            Object.values(weapons).forEach(weapon => {
                if (!weapon || !weapon._props || !weapon._props.Slots) {
                    return; // Skip if weapon or its properties are null
                }

                weapon._props.Slots.forEach(slot => {
                    if (!slot._props || !slot._props.filters) {
                        return; // Skip if slot properties or filters are null
                    }

                    // Get the first Filter array
                    const filterIds = slot._props.filters[0]?.Filter;

                    if (filterIds && filterIds.length > 0) {
                        // Collect the _parent IDs and paths corresponding to these filter IDs
                        const parentIds = [];
                        const paths = [];


                        filterIds.forEach(filterId => {
                            const weaponInfo = weapons[filterId];
                            if (weaponInfo) {
                                if (weaponInfo._parent && weaponInfo._parent !== excludedId) {
                                    parentIds.push(weaponInfo._parent);
                                }
                                if (weaponInfo._props && weaponInfo._props.path && weaponInfo._props.path !== "") {
                                    paths.push(weaponInfo._props.path.split('/').slice(0, -1).join('/')); // Extract folder structure
                                }
                            }
                        });
                        const updatedFilterIds = [];
                        if (ALLOW_EVERYTHING_WITH_EVERYTHING) {
                            Object.entries(weapons).forEach(([id, weaponInfo]) => {
                                if (!weaponInfo._props) return;
                                updatedFilterIds.push(id);
                            });
                        }
                        else {

                            Object.entries(weapons).forEach(([id, weaponInfo]) => {
                                if (!weaponInfo._props) return;

                                const weaponPath = weaponInfo._props.path ? weaponInfo._props.path.split('/').slice(0, -1).join('/') : "";
                                const matchesParent = weaponInfo._parent && parentIds.includes(weaponInfo._parent);
                                const matchesPath = weaponPath && paths.some(path => path === weaponPath);

                                if (matchesParent || matchesPath) {
                                    updatedFilterIds.push(id);
                                }
                            });
                        }
                        // Find all IDs in weapons that have the same _parent IDs or folder structure in path


                        // Update the Filter field of the slot
                        slot._props.filters[0].Filter = updatedFilterIds;
                    }
                });
            });
        }
        exchangePrefabPath(db);
        updateSlotFilters(db);


    type FieldConfig = {
        isFloat: boolean;
        canBeNegative: boolean;
        maxMultiplier: number;
        minValue?: number;
        maxValue?: number;
    };
    function randomizeFields(db: any, fieldConfigs: { [fieldName: string]: FieldConfig }): void {
        const keys = Object.keys(db);

        keys.forEach(key => {
            const item = db[key];
            if (!item._props || item._id == EXCLUDED_ID) {
                return; // Skip if no _props
            }

            // Randomize standard fields
            Object.entries(fieldConfigs).forEach(([fieldName, config]) => {
                if (typeof item._props[fieldName] === 'number') {
                    item._props[fieldName] = randomizeValue(item._props[fieldName], config);
                }
            });

            // Special handling for Cartridges
            if (item._props.Cartridges) {
                item._props.Cartridges.forEach((cartridge: any) => {
                    if (cartridge._max_count) {
                        cartridge._max_count = randomizeCartridgeCount(cartridge._max_count);
                    }
                });
            }
        });
    }

    function randomizeCartridgeCount(originalCount: number): number {
        const multiplier = 1 + Math.floor(rng.random() * CARTRIDGE_MULTIPLIER_MAX); // Multiplier from 1 to 30
        let randomizedCount = originalCount * multiplier;
        return Math.max(1, randomizedCount); // Ensure the count is at least 1
    }

    // Existing randomizeValue function and fieldConfigurations


    function randomizeValue(originalValue: number, config: FieldConfig): number {
        const range = config.maxMultiplier - VALUE_RANGE_MIN;
        const balancedMultiplier = VALUE_RANGE_MIN + rng.random() * range;
        let randomizedValue = originalValue * balancedMultiplier;

        // Enforce minimum and maximum limits
        if (config.minValue !== undefined) {
            randomizedValue = Math.max(randomizedValue, config.minValue);
        }
        if (config.maxValue !== undefined) {
            randomizedValue = Math.min(randomizedValue, config.maxValue);
        }

        if (config.isFloat) {
            randomizedValue = parseFloat(randomizedValue.toFixed(2));
        } else {
            randomizedValue = Math.round(randomizedValue);
        }

        if (!config.canBeNegative && randomizedValue < 0) {
            randomizedValue = Math.abs(randomizedValue);
        }

        return randomizedValue;
    }

    // Example usage:


    randomizeFields(db, fieldConfigurations);



    function deleteFolderInAppData() {
        const userProfile = process.env.USERPROFILE;

        if (!userProfile) {
            console.error('User profile path not found.');
            return;
        }

        const folderPath = path.join(userProfile, Mod.FOLDER_RELATIVE_PATH);

        try {
            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
                console.log(`Deleted folder: ${folderPath} - This is safe, it just removed the cached pictures for the inventory. They get quickly regenerated when looking in the inventory.`);
            } else {
                console.log(`Folder not found: ${folderPath}`);
            }
        } catch (err) {
            console.error(`Error deleting folder: ${err}`);
        }
    }
    deleteFolderInAppData();
    // Example usage
    // Provide the full path to the folder you want to delete
    //deleteFolder(pathToDelete);


    }
}

module.exports = { mod: new Mod() };

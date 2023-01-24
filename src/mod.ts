import { DependencyContainer } from "tsyringe";

import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";


class Mod implements IPreAkiLoadMod, IPostAkiLoadMod, IPostDBLoadMod {

    public postDBLoad(container: DependencyContainer): void {
        //CONFIGURATION AREA START
        const sillysettings = false;
        //CONFIGURATION AREA END



        // Database will be loaded, this is the fresh state of the DB so NOTHING from the AKI
        // logic has modified anything yet. This is the DB loaded straight from the JSON files
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const DB = databaseServer.getTables();

        const items = DB.templates.items;

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        //TODO: Randomizer Start
        const randompicker = {}
        const arrayrandom = []
        let counter2 = 0;;
        for (const id in items) {
            const base = items[id]
            if (!randompicker[base._parent]) {
                randompicker[base._parent] = []
            }
            randompicker[base._parent].push(base)
            if (items[id]._type == "Item" && items[id]._parent != undefined && items[id]._parent != "" && items[id]._props && !items[id]._props.IsUnremovable) { //&& items[id]._props.Durability > 0 (kicks out ammo)
                arrayrandom.push(base)
            }
            counter2++
        }
        const fieldarray = ["Name", "LootExperience", "ExamineExperience", "Durability", "Accuracy", "Recoil", "Loudness", "EffectiveDistance", "Ergonomics", "Velocity", "DoubleActionAccuracyPenaltyMult", "HeatFactor", "CoolFactor", "SingleFireRate", "bFirerate", "RecoilForceUp", "RecoilForceBack", "RecoilAngle", "shotgunDispersion", "ammoAccr", "Tracer", "TracerColor", "TracerDistance", "Damage", "ProjectileCount", "RicochetChance", "MinFragmentsCount", "MaxFragmentsCount", "ShowBullet", "BallisticCoeficient", "SpeedRetardation", "InitialSpeed", "TrajectoryDeviationChance", "TrajectoryDeviation", "AmmoLifeTimeSec", "Prefab"];
        let counter = 0;
        for (const id in items) {
            counter++
            console.clear();
            console.log("Loading Randomizer")
            console.log(counter + " \ " + counter2)
            for (const id2 in items[id]) {
                for (const id3 in items[id][id2]) {
                    for (let index = 0; index < arrayrandom.length; index++) {
                        if (
                            id2 == "_props" && fieldarray.indexOf(id3) >= 0 && items[id] != undefined && items[id][id2] != undefined && items[id][id2][id3] != undefined &&
                            arrayrandom[index] != undefined && arrayrandom[index][id2] != undefined && arrayrandom[index][id2][id3] != undefined &&
                            items[id][id2][id3] !== null &&
                            Object.getOwnPropertyDescriptor(items[id][id2], id3).writable && Object.getOwnPropertyDescriptor(arrayrandom[index][id2], id3).writable
                        ) {
                            if (id3 == "Prefab") {
                                if (items[id]._parent == arrayrandom[index]._parent) {
                                    const cache = JSON.parse(JSON.stringify(items[id][id2][id3]))
                                    items[id][id2][id3] = JSON.parse(JSON.stringify(arrayrandom[index][id2][id3]))
                                    arrayrandom[index][id2][id3] = JSON.parse(JSON.stringify(cache))
                                    shuffle(arrayrandom)
                                    break;
                                }
                            } else {
                                const cache = JSON.parse(JSON.stringify(items[id][id2][id3]))
                                items[id][id2][id3] = JSON.parse(JSON.stringify(arrayrandom[index][id2][id3]))
                                arrayrandom[index][id2][id3] = JSON.parse(JSON.stringify(cache))
                                shuffle(arrayrandom)
                                break;
                            }

                        }

                    }
                }


            }
        }


        if (sillysettings) {
            for (const id in items) {
                const base = items[id]



                // 			TODO:

                // Weapons
                //This is on purpose lazyily done - I just wanted it to be done quick
                // if (base._props && (base._props.Tracer == false || base._props.Tracer == true)) {



                // 	shuffle(randompicker[base._parent])

                // 	let cache = {_props:{}}
                // 	cache._props.ammoAccr = base._props.ammoAccr
                // 	cache._props.Tracer = base._props.Tracer
                // 	cache._props.TracerColor = base._props.TracerColor
                // 	cache._props.TracerDistance = base._props.TracerDistance
                // 	cache._props.Damage = base._props.Damage
                // 	cache._props.ProjectileCount = base._props.ProjectileCount
                // 	cache._props.RicochetChance = base._props.RicochetChance
                // 	cache._props.MinFragmentsCount = base._props.MinFragmentsCount
                // 	cache._props.MaxFragmentsCount =base._props.MaxFragmentsCount
                // 	cache._props.ShowBullet =base._props.ShowBullet
                // 	cache._props.BallisticCoeficient = base._props.BallisticCoeficient
                // 	cache._props.SpeedRetardation = base._props.SpeedRetardation
                // 	cache._props.InitialSpeed = base._props.InitialSpeed
                // 	cache._props.TrajectoryDeviationChance =base._props.TrajectoryDeviationChance
                // 	cache._props.TrajectoryDeviation =base._props.TrajectoryDeviation
                // 	cache._props.AmmoLifeTimeSec =base._props.AmmoLifeTimeSec
                // 	base._props.ammoAccr =randompicker[base._parent][0]._props.ammoAccr
                // 	base._props.Tracer =randompicker[base._parent][0]._props.Tracer
                // 	base._props.TracerColor =  randompicker[base._parent][0]._props.TracerColor
                // 	base._props.TracerDistance =  randompicker[base._parent][0]._props.TracerDistance
                // 	base._props.Damage =  randompicker[base._parent][0]._props.Damage
                // 	base._props.ProjectileCount = randompicker[base._parent][0]._props.ProjectileCount
                // 	base._props.RicochetChance =  randompicker[base._parent][0]._props.RicochetChance
                // 	base._props.MinFragmentsCount = randompicker[base._parent][0]._props.MinFragmentsCount
                // 	base._props.MaxFragmentsCount =randompicker[base._parent][0]._props.MaxFragmentsCount
                // 	base._props.ShowBullet =randompicker[base._parent][0]._props.ShowBullet
                // 	base._props.BallisticCoeficient = randompicker[base._parent][0]._props.BallisticCoeficient
                // 	base._props.SpeedRetardation = randompicker[base._parent][0]._props.SpeedRetardation
                // 	base._props.InitialSpeed =randompicker[base._parent][0]._props.InitialSpeed
                // 	base._props.TrajectoryDeviationChance =randompicker[base._parent][0]._props.TrajectoryDeviationChance
                // 	base._props.TrajectoryDeviation = randompicker[base._parent][0]._props.TrajectoryDeviation
                // 	base._props.AmmoLifeTimeSec =randompicker[base._parent][0]._props.AmmoLifeTimeSec

                // 	randompicker[base._parent][0]._props.ammoAccr = cache._props.ammoAccr
                // 	randompicker[base._parent][0]._props.Tracer = cache._props.Tracer  
                // 	randompicker[base._parent][0]._props.TracerColor = cache._props.TracerColor 
                // 	randompicker[base._parent][0]._props.TracerDistance = cache._props.TracerDistance
                // 	randompicker[base._parent][0]._props.Damage = cache._props.Damage 
                // 	randompicker[base._parent][0]._props.ProjectileCount = cache._props.ProjectileCount 
                // 	randompicker[base._parent][0]._props.RicochetChance = cache._props.RicochetChance 
                // 	randompicker[base._parent][0]._props.MinFragmentsCount = cache._props.MinFragmentsCount 
                // 	randompicker[base._parent][0]._props.MaxFragmentsCount =cache._props.MaxFragmentsCount
                // 	randompicker[base._parent][0]._props.ShowBullet =cache._props.ShowBullet 
                // 	randompicker[base._parent][0]._props.BallisticCoeficient = cache._props.BallisticCoeficient
                // 	randompicker[base._parent][0]._props.SpeedRetardation = cache._props.SpeedRetardation
                // 	randompicker[base._parent][0]._props.InitialSpeed = cache._props.InitialSpeed 
                // 	randompicker[base._parent][0]._props.TrajectoryDeviationChance =cache._props.TrajectoryDeviationChance
                // 	randompicker[base._parent][0]._props.TrajectoryDeviation =cache._props.TrajectoryDeviation 
                // 	randompicker[base._parent][0]._props.AmmoLifeTimeSec =cache._props.AmmoLifeTimeSec


                // }

                // if(base._parent.includes("5422acb9af1c889c16000029") && base._props && base._props.SingleFireRate){


                // 	shuffle(randompicker[base._parent])

                // 	let cache = {_props:{}}
                // 	cache._props.SingleFireRate		= base._props.SingleFireRate	
                // 	cache._props.bFirerate			= base._props.bFirerate		
                // 	cache._props.RecoilForceUp		= base._props.RecoilForceUp	
                // 	cache._props.RecoilForceBack 	= base._props.RecoilForceBack 
                // 	cache._props.RecoilAngle 		= base._props.RecoilAngle 	
                // 	cache._props.shotgunDispersion	= base._props.shotgunDispersion

                // 	base._props.SingleFireRate		=	randompicker[base._parent][0]._props.SingleFireRate	
                // 	base._props.bFirerate			=	randompicker[base._parent][0]._props.bFirerate		
                // 	base._props.RecoilForceUp		=	randompicker[base._parent][0]._props.RecoilForceUp	
                // 	base._props.RecoilForceBack		=	randompicker[base._parent][0]._props.RecoilForceBack	
                // 	base._props.RecoilAngle			=	randompicker[base._parent][0]._props.RecoilAngle		
                // 	base._props.shotgunDispersion	=	randompicker[base._parent][0]._props.shotgunDispersion

                // 	randompicker[base._parent][0]._props.SingleFireRate		=	cache._props.SingleFireRate	
                // 	randompicker[base._parent][0]._props.bFirerate			=	cache._props.bFirerate		
                // 	randompicker[base._parent][0]._props.RecoilForceUp		=	cache._props.RecoilForceUp	
                // 	randompicker[base._parent][0]._props.RecoilForceBack	=	cache._props.RecoilForceBack 
                // 	randompicker[base._parent][0]._props.RecoilAngle		=	cache._props.RecoilAngle 	
                // 	randompicker[base._parent][0]._props.shotgunDispersion	=	cache._props.shotgunDispersion

                // }

                // if(base._parent.includes("5448f3a64bdc2d60728b456a")){

                // 	shuffle(randompicker[base._parent])

                // 	let cache = {_props:{}}

                // 	cache._props.SingleFireRate = base._props.SingleFireRate 
                // 	base._props.SingleFireRate = randompicker[base._parent][0]._props.SingleFireRate
                // 	randompicker[base._parent][0]._props.SingleFireRate = cache._props.SingleFireRate

                // }

                // if(base._id != "5448bc234bdc2d3c308b4569" && base._props != undefined && base._props.Cartridges != undefined && base._props.Cartridges.length > 0 && base._props.Cartridges[0]._max_count != undefined){

                // 	shuffle(randompicker[base._parent])
                // 	let cache = {}
                // 	cache._props = {}
                // 	while(items[randompicker[base._parent][0]._id]._props.Cartridges == undefined || !items[randompicker[base._parent][0]._id]._props.Cartridges.length > 0){
                // 		console.log(items[randompicker[base._parent][0]])
                // 		shuffle(randompicker[base._parent])
                // 	}
                // 	cache._props._max_count = base._props.Cartridges[0]._max_count
                // 	base._props.Cartridges[0]._max_count = items[randompicker[base._parent][0]._id]._props.Cartridges[0]._max_count
                // 	items[randompicker[base._parent][0]._id]._props.Cartridges[0]._max_count = cache._props._max_count

                // }

                if (base._props || base._props.Tracer == false || base._props.Tracer == true) {
                    base._props.ammoAccr = -500;
                    base._props.Tracer = true;
                    base._props.TracerColor = "red";
                    base._props.TracerDistance = 1;
                    base._props.Damage = Math.floor(((base._props.Damage * 0.5) * Math.random()));
                    base._props.ProjectileCount = Math.floor(((base._props.ProjectileCount + 5) * 10) * Math.random());
                    base._props.RicochetChance = 1;
                    base._props.MinFragmentsCount = 20;
                    base._props.MaxFragmentsCount = 70;
                    base._props.ShowBullet = true;
                    base._props.BallisticCoeficient = 1;
                    base._props.SpeedRetardation = 0;
                    base._props.InitialSpeed = Math.floor(Math.random() * (base._props.InitialSpeed * 0.4));
                    base._props.TrajectoryDeviationChance = 1;
                    base._props.TrajectoryDeviation = 1;
                    base._props.AmmoLifeTimeSec = 30;
                }

                if (base._parent.includes("5422acb9af1c889c16000029") && base._props && base._props.SingleFireRate) {
                    base._props.SingleFireRate = Math.floor((base._props.SingleFireRate * 5 + 170) * Math.random())
                    base._props.bFirerate = Math.floor((base._props.bFirerate * 5 + 170) * Math.random())
                    base._props.RecoilForceUp = Math.floor((base._props.RecoilForceUp * 0.1) * Math.random())
                    base._props.RecoilForceBack = Math.floor((base._props.RecoilForceBack * 0.1) * Math.random())
                    base._props.RecoilAngle = Math.floor((base._props.RecoilAngle * 0.1) * Math.random())
                    base._props.shotgunDispersion = Math.floor((base._props.shotgunDispersion * 5 + 70) * Math.random())
                }

                if (base._parent.includes("5448f3a64bdc2d60728b456a")) {
                    base._props.SingleFireRate = base._props.SingleFireRate * 5 + 100
                }

                if (base._props && base._props.Cartridges && base._props.Cartridges.length > 0 && base._props.Cartridges[0]._max_count) {
                    base._props.Cartridges[0]._max_count = base._props.Cartridges[0]._max_count * 6 + 33
                }

                // if (base._parent.includes("543be6564bdc2df4348b4568")) {
                // 	base._props.FragmentsCount = 300;
                // 	base._props.FragmentType = "5485a8684bdc2da71d8b4567";
                // 	base._props.MinExplosionDistance = 50;
                // 	base._props.MaxExplosionDistance = 400;
                // 	base._props.ContusionDistance = 550;
                // 	base._props.Contusion = {
                // 		"x": 250,
                // 		"y": 250,
                // 		"z": 250
                // 	};
                // 	base._props.Blindness = {
                // 		"x": 250,
                // 		"y": 250,
                // 		"z": 250
                // 	};
                // 	base._props.ArmorDistanceDistanceDamage = {
                // 		"x": 250,
                // 		"y": 250,
                // 		"z": 250
                // 	};
                // }
            }
        }

    }

}

module.exports = { mod: new Mod() }
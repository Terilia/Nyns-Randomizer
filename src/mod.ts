import { DependencyContainer, inject, injectable } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";

@injectable()
class Mod implements IPreAkiLoadMod, IPostAkiLoadMod, IPostDBLoadMod {
  public postDBLoad(c: DependencyContainer) {
    //START CONFIG 
    const sillymode = false;
    const textsilly = false;
    const everythingwitheveryting = false;
    //END CONFIG

    const itemhelper = c.resolve<ItemHelper>("ItemHelper");
    const db = c.resolve<DatabaseServer>("DatabaseServer").getTables().templates.items;
    const f = ["Name", "LootExperience", "ExamineExperience", "Durability", "Accuracy", "Recoil", "Loudness", "EffectiveDistance", "Ergonomics", "Velocity", "DoubleActionAccuracyPenaltyMult", "HeatFactor", "CoolFactor", "SingleFireRate", "bFirerate", "RecoilForceUp", "RecoilForceBack", "RecoilAngle", "shotgunDispersion", "ammoAccr", "Tracer", "TracerColor", "TracerDistance", "Damage", "ProjectileCount", "RicochetChance", "MinFragmentsCount", "MaxFragmentsCount", "ShowBullet", "BallisticCoeficient", "SpeedRetardation", "InitialSpeed", "TrajectoryDeviationChance", "TrajectoryDeviation", "AmmoLifeTimeSec", "Prefab", "ItemSound"];
    const r = {};
    const a = [];
    let allids = c.resolve<DatabaseServer>("DatabaseServer").getTables().allids
    allids = [];
    let mmodid = c.resolve<DatabaseServer>("DatabaseServer").getTables().mmodid
    mmodid = []
    for (const i in db) {
      const b = db[i];
      if (!r[b._parent]) r[b._parent] = [];
      r[b._parent].push(b);
      if (b._type == "Item" && b._parent && b._props) {
        a.push(b);
        allids.push(b._id);
      }

    }

    function s(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    class ProgressBar {
      public total: number;
      public current: number;
      public barLength: number;
      public barChar: string;
      public emptyChar: string;

      constructor(total: number, barLength: number = 10, barChar: string = '???', emptyChar: string = '???') {
        this.total = total;
        this.current = 0;
        this.barLength = barLength;
        this.barChar = barChar;
        this.emptyChar = emptyChar;
      }

      public render() {
        const percent = (this.current / this.total) * 100;
        const filled = Math.floor((this.barLength * this.current) / this.total);
        const empty = this.barLength - filled;
        const filledBar = this.barChar.repeat(filled);
        const emptyBar = this.emptyChar.repeat(empty);
        console.clear()
        console.log(`\r[${filledBar}${emptyBar}] ${percent.toFixed(2)}% - Loading Randomizer - Oh god help us`);
      }

      public update(value: number) {
        this.current = value;
        this.render();
      }

      public complete() {
        this.current = this.total;
        this.render();
        console.log();
      }
    }
    const progressBar = new ProgressBar(100);
    const locales = Object.values(c.resolve<DatabaseServer>("DatabaseServer").getTables().locales.global) as Record<string, string>[];
    let counter = 0;
    if (textsilly) {
      for (const test in locales) {
        if (test == 2) { // 2 = english, this takes a long time. 
          for (const test2 in locales[test]) {
            counter++
            const temp = JSON.parse(JSON.stringify(locales[test][test2]))
            let reference = Object.keys(locales[test]).length * Math.random() << 0
            locales[test][test2] = locales[test][Object.keys(locales[test])[reference]]
            locales[test][Object.keys(locales[test])[reference]] = temp
            if (Math.random() > 0.97) { console.clear() console.log(counter + " / " + Object.keys(locales[test]).length + " Changing Textfields! OH WOW!") }
          }
        }
      }
    }
    for (const id in db) {

      if (itemhelper.isOfBaseclasses(id, [BaseClasses.MOD, BaseClasses.FUNCTIONAL_MOD, BaseClasses.STOCK, BaseClasses.FOREGRIP, BaseClasses.MASTER_MOD, BaseClasses.MOUNT, BaseClasses.MUZZLE, BaseClasses.SIGHTS, BaseClasses.LIGHT_LASER_DESIGNATOR, BaseClasses.FLASH_HIDER, BaseClasses.IRON_SIGHT, BaseClasses.COLLIMATOR, BaseClasses.COMPACT_COLLIMATOR, BaseClasses.COMPENSATOR, BaseClasses.OPTIC_SCOPE, BaseClasses.SPECIAL_SCOPE, BaseClasses.SILENCER]) && !itemhelper.isOfBaseclasses(id, [BaseClasses.MAGAZINE, BaseClasses.CYLINDER_MAGAZINE, BaseClasses.AMMO])) {
        mmodid.push(db[id]._id)
        db[id]._props.RaidModdable = true;
        db[id]._props.ToolModdable = false;
      }
    }

    if (everythingwitheveryting) {
      for (const id in db) {
        if (itemhelper.isOfBaseclasses(id, [BaseClasses.WEAPON, BaseClasses.MOUNT, BaseClasses.SIGHTS])) {
          for (const slots in db[id]._props.Slots) {
            if (db[id]._props.Slots[slots]._name != "mod_magazine") db[id]._props.Slots[slots]._props.filters[0].Filter = mmodid.concat(db[id]._props.Slots[slots]._props.filters[0].Filter);
          }
        }
      }
    }

    for (const id in db) {
      if (Math.random() > 0.9) progressBar.update((Object.keys(db).indexOf(id) / Object.keys(db).length) * 100)
      for (const id2 in db[id]) {
        for (const id3 in db[id][id2]) {
          for (let i = 0; i < a.length; i++) {
            if (
              id2 == "_props" && f.indexOf(id3) >= 0 && db[id] && db[id][id2] && db[id][id2][id3] &&
              a[i] && a[i][id2] && a[i][id2][id3] &&
              Object.getOwnPropertyDescriptor(db[id][id2], id3).writable && Object.getOwnPropertyDescriptor(a[i][id2], id3).writable
            ) {

              if (id3 == "Prefab") {
                if (id3 == "Prefab" && db[id]._parent == a[i]._parent && a[i][id2][id3].path && a[i][id2][id3].path != "" && db[id][id2][id3].path && db[id][id2][id3].path != "") {
                  const cache = JSON.parse(JSON.stringify(db[id][id2][id3]))
                  db[id][id2][id3] = JSON.parse(JSON.stringify(a[i][id2][id3]))
                  a[i][id2][id3] = JSON.parse(JSON.stringify(cache))
                  s(a);
                  break;
                } else {

                }
              } else {
                if (sillymode) {
                  if (Number.isInteger(db[id][id2][id3])) {
                    db[id][id2][id3] = Math.floor(db[id][id2][id3] * Math.random() * (Math.random() * 10))
                  } else {
                    if (typeof db[id][id2][id3] == "number") db[id][id2][id3] = 2 * Math.random() * db[id][id2][id3];
                  }
                }
                const cache = JSON.parse(JSON.stringify(db[id][id2][id3]))
                db[id][id2][id3] = JSON.parse(JSON.stringify(a[i][id2][id3]))
                a[i][id2][id3] = JSON.parse(JSON.stringify(cache))
                s(a);

                break;
              }
            }
          }
        }
      }
    }
  }
}

module.exports = { mod: new Mod() }
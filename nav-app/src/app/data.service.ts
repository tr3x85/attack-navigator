import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http'
import { Http } from '@angular/http'
import { Observable } from "rxjs/Rx"

@Injectable()
export class DataService {

    constructor(private http: Http) { }

        // Observable for data in config.json
        private configData$: Observable<Object>;

        // Observables for data
        private enterpriseData$: Observable<Object>;
        private mobileData$: Observable<Object>;
        private tacticData$: Observable<Object>;

        // Order of tactics to be displayed in application
        private actTacticsOrder: String[] = [];
        private prepareTacticsOrder: String[] = [];
        private totalTacticsOrder: String[] = [];

        // URLs in case config file doesn't load properly
        private enterpriseAttackURL: string = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json";
        private pre_attack_URL: string = "https://raw.githubusercontent.com/mitre/cti/master/pre-attack/pre-attack.json";
        private mobileDataURL: string = "https://raw.githubusercontent.com/mitre/cti/master/mobile-attack/mobile-attack.json";
        private tacticsURL: string = "assets/tacticsData.json";

        setUpURLs(eAttackURL, preAttackURL, mURL, tURL){
            this.enterpriseAttackURL = eAttackURL;
            this.pre_attack_URL = preAttackURL;
            this.mobileDataURL = mURL;
            this.tacticsURL = tURL;
        }

        retreiveConfig(refresh:boolean = false){
            if (refresh || !this.configData$){
                this.configData$ = this.http.get("./assets/config.json").map(res => res.json())   
            }
            return this.configData$;
        }

        getEnterpriseData(refresh: boolean = false){
            //load from remote if not yet loaded or refresh=true
            if (refresh || !this.enterpriseData$){
                this.enterpriseData$ = Observable.forkJoin(
                    this.http.get(this.enterpriseAttackURL).map(res => res.json()),
                    this.http.get(this.pre_attack_URL).map(res => res.json())
                );
            } 
            return this.enterpriseData$ //observable
        }

        getMobileData(refresh: boolean = false){
            //load from remote if not yet loaded or refresh=true
            if (refresh || !this.mobileData$){
                this.mobileData$ = Observable.forkJoin(
                    this.http.get(this.mobileDataURL).map(res => res.json()),
                    this.http.get(this.pre_attack_URL).map(res => res.json())
                );
            } 
            return this.mobileData$ //observable
        }

        getTactics(refresh: boolean = false){
            if (refresh || !this.tacticData$){
                this.tacticData$ = this.http.get(this.tacticsURL).map(res => res.json())
            } 
            return this.tacticData$ //observable
        }

        setTacticOrder(retrievedTactics){
            for(var i = 0; i < retrievedTactics.length; i++){
                var phase = retrievedTactics[i].phase;
                var tactic = retrievedTactics[i].tactic;
                if(phase.localeCompare("prepare") === 0){
                    this.prepareTacticsOrder.push(tactic);
                } else {
                    this.actTacticsOrder.push(tactic);
                }
                this.totalTacticsOrder.push(tactic);
            }
        }

        /**
         * Convert a list of techniques to a list of tactics, each one containing the techniques of the tactic
         * @param  {[object]} techniques the techniques to convert
         * @return {object}              object with keys of each tactic and values of the techniques of those tactics
         */
        techniquesToTactics(techniques: Technique[]) {
            if (techniques.length === 0) return []
            var tactics = {};
            techniques.forEach(function(technique) {
                technique.tactics.forEach(function(tt) {
                    if (tactics[tt]) tactics[tt].push(technique)
                    else tactics[tt] = [technique];
                });
            });
            return tactics;
        }

        /**
         * Extract all tactic names from the list of techniques
         * @param  {[object]} techniques the techniques to extract
         * @return {[string]}            an array of all tactic names
         */
        tacticNames(techniques: Technique[]) {
            if (techniques.length === 0) return []
            var techniquesFinal: String[] = [];
            var seen = new Set();
            techniques.forEach(function(technique) {
                technique.tactics.forEach(function(tt) {
                    seen.add(tt);
                });
            });
            for(var i = 0; i < this.totalTacticsOrder.length; i++){
                var tactic = this.totalTacticsOrder[i];
                if(seen.has(tactic)){
                    techniquesFinal.push(tactic);
                }
            }
            return techniquesFinal;
        }

    
}

export class Technique {
    description: string;
    external_references_url: string;
    id: string;
    tactics: string[];
    name: string;
    platforms: string[];
    technique_id: string;
    constructor(name: string, description: string, tactics: string[], url: string, platforms: string[], id: string, tid: string) {
        this.name = name; this.description = description, this.tactics = tactics;
        this.id = id; this.platforms = platforms; this.external_references_url = url;
        this.technique_id = tid;
    }
}

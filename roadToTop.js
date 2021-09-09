const LEVEL_MAX = 80;
const BLU_LEVEL_MAX = 70;
const TOTAL_LEVELS_BATTLE = ((LEVEL_MAX * 16) + BLU_LEVEL_MAX);
const TOTAL_LEVELS_CRAFT_GATHERING = 11 * LEVEL_MAX;
const TOTAL_LEVELS  = TOTAL_LEVELS_CRAFT_GATHERING + TOTAL_LEVELS_BATTLE;
const TANK_CLASS_ID = [1,3,32,37];
const MELEE_DPS_CLASS_ID = [2,4,29,34];
const HEALER_CLASS_ID = [6,4,29,34];
const PHYS_RANGED_DPS_CLASS_ID = [2,4,29,34];
const MAG_RANGED_DPS_CLASS_ID = [2,4,29,34];
const xp = new Map([
    [1, 0],
    [2, 300],
    [3, 900],
    [4, 2000],
    [5, 3700],
    [6, 6000],
    [7, 10200],
    [8, 16200],
    [9, 23550],
    [10, 33480],
    [11, 45280],
    [12, 60880],
    [13, 80480],
    [14, 104180],
    [15, 130580],
    [16, 161080],
    [17, 196480],
    [18, 236980],
    [19, 282680],
    [20, 333680],
    [21, 390280],
    [22, 454180],
    [23, 525580],
    [24, 604680],
    [25, 691780],
    [26, 786980],
    [27, 896780],
    [28, 1021580],
    [29, 1161780],
    [30, 1317680],
    [31, 1480180],
    [32, 1656080],
    [33, 1845680],
    [34, 2049180],
    [35, 2267080],
    [36, 2499400],
    [37, 2749300],
    [38, 3017100],
    [39, 3303300],
    [40, 3608200],
    [41, 3932200],
    [42, 4272400],
    [43, 4629200],
    [44, 5002900],
    [45, 5393700],
    [46, 5801900],
    [47, 6239500],
    [48, 6707000],
    [49, 7205000],
    [50, 7734000],
    [51, 8598000],
    [52, 9656400],
    [53, 10923600],
    [54, 12478800],
    [55, 14350800],
    [56, 16568400],
    [57, 19160400],
    [58, 22155600],
    [59, 25582800],
    [60, 29470800],
    [61, 33940800],
    [62, 38813800],
    [63, 44129800],
    [64, 49938800],
    [65, 56302800],
    [66, 63297800],
    [67, 71019800],
    [68, 79594800],
    [69, 89187800],
    [70, 100013800],
    [71, 112462800],
    [72, 126343800],
    [73, 141899800],
    [74, 159398400],
    [75, 179148400],
    [76, 201478400],
    [77, 226818400],
    [78, 255468400],
    [79, 288218400],
    [80, 325868400],
]);


async function searchCharacter(charName, server) {
    let lodestoneId;
    var searchUrl = new URL("https://xivapi.com/character/search"), params = { name: charName, server: server };
    Object.keys(params).forEach(key => searchUrl.searchParams.append(key, params[key]));

    const response = await fetch(searchUrl, {cache: "force-cache"})
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

    if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
            response.status);
        return;
    }
    let data = await response.json();
    //document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);
    if (data && data.Results) {
        console.log(data);
        return data.Results[0].ID;


    }
}

async function getCharacterInfo(lodestoneId) {

    let getCharacterUrl = new URL(lodestoneId, "https://xivapi.com/character/");
    console.log("getCharacterInfo " + lodestoneId);

    const response = await fetch(getCharacterUrl, {cache: "force-cache"})
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });

    if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
            response.status);
        return;
    }

    let data = await response.json();
    //document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);
    if (data && data.Character && data.Character.ClassJobs) {
        console.log(data);

        return data.Character.ClassJobs;

    }
}

async function calculate(classJobs, targetDate) {
    let data = {
        jobs: [],
        levels: 0,
        levelsToGo: 0,
        exp: 0,
        expToGo: 0,
        targetDate: targetDate,
        daysToGo: Math.round((targetDate - Date.now()) / (24 * 60 * 60 * 1000)),
        levelsPerDay: 0,
        expPerDay: 0,
        combat: {
            levels: 0,
            levelsToGo: 0,
            exp: 0,
            expToGo: 0,
        },
        craftingGathering: {
            levels: 0,
            levelsToGo: 0,
            exp: 0,
            expToGo: 0,

        }
    }

    

    if (classJobs) {
        for (let i = 0, len = classJobs.length; i < len; i++) {

            let classDto = {
                name: classJobs[i].UnlockedState.Name,
                level: classJobs[i].Level,
                levelExp: classJobs[i].ExpLevel,
                levelExpToGo: classJobs[i].ExpLevelTogo,
                isSpecialised: classJobs.IsSpecialised

            };

            if(TANK_CLASS_ID.includes(classJobs[i].ClassID)){
                classDto.tank = true;
            }

            if(MELEE_DPS_CLASS_ID.includes(classJobs[i].ClassID)){
                classDto.meleeDps = true;
            }

            if (classJobs[i].ClassID == 36) {
                classDto.levelsToGo = BLU_LEVEL_MAX - classJobs[i].Level
                classDto.exp = xp.get(classJobs[i].Level) + classJobs[i].ExpLevel;
                classDto.expToGo = xp.get(BLU_LEVEL_MAX) - classDto.exp;
                classDto.name = "Blue Mage";
            } else {
                classDto.levelsToGo = LEVEL_MAX - classJobs[i].Level
                classDto.exp = xp.get(classJobs[i].Level) + classJobs[i].ExpLevel;
                classDto.expToGo = xp.get(LEVEL_MAX) - classDto.exp;
            }
            
            if (classJobs[i].JobID > 7 && classJobs[i].JobID < 19) {

                data.craftingGathering.levelsToGo += classDto.levelsToGo
                data.craftingGathering.levels += classDto.level
                data.craftingGathering.exp += classDto.exp;
                data.craftingGathering.expToGo += classDto.expToGo
                
            } else if (classJobs[i].JobID !== 27) {
                data.combat.levelsToGo += classDto.levelsToGo
                data.combat.levels += classDto.level
                data.combat.exp += classDto.exp;
                data.combat.expToGo += classDto.expToGo
                 
            }

            data.jobs.push(classDto);
        }

        data.combat.percentage = ((TOTAL_LEVELS_BATTLE - data.combat.levelsToGo) / TOTAL_LEVELS_BATTLE) * 100;
        data.craftingGathering.percentage = ((TOTAL_LEVELS_CRAFT_GATHERING - data.craftingGathering.levelsToGo) / TOTAL_LEVELS_CRAFT_GATHERING) * 100;
        data.levels = data.combat.levels + data.craftingGathering.levels;
        data.levelsToGo = data.combat.levelsToGo + data.craftingGathering.levelsToGo;
        data.percentage = ((TOTAL_LEVELS - data.levelsToGo) / TOTAL_LEVELS) * 100;
        data.exp = data.combat.exp + data.craftingGathering.exp;
        data.expToGo = data.combat.expToGo + data.craftingGathering.expToGo;
        data.expPerDay = data.expToGo / data.daysToGo;
        data.levelsPerDay = data.levelsToGo / data.daysToGo;
        data.wholeLevelsPerDay= Math.ceil(data.levelsToGo / data.daysToGo);
        data.daysToGoIfWholeLevel =  Math.ceil(data.levelsToGo / data.wholeLevelsPerDay);
        data.craftingGathering.expPerDay = data.craftingGathering.expToGo / data.daysToGo;
        data.craftingGathering.levelsPerDay = data.craftingGathering.levelsToGo / data.daysToGo;
        data.combat.expPerDay = data.combat.expToGo / data.daysToGo;
        data.combat.levelsPerDay = data.combat.levelsToGo / data.daysToGo;
    }
    return data;
}



const createRow = function(classData) {
    var row = document.createElement("div");
    row.className = "row";

    var icon = document.createElement("div");
    icon.className = "col-1 icon";
    const stringName = classData.name.replace(/\s+/g, '');
    icon.appendChild(document.createElement("img")).src = `images/jobicons/${stringName}.png`
    row.appendChild(icon);

    var level = document.createElement("div");
    levelText = document.createElement("p").innerText = classData.level
    level.append(levelText);
    row.appendChild(level);

    var classNamePercent = document.createElement("div");
    classNamePercent.className = "col"
    var percentageDiv = document.createElement("div");
    percentageDiv.className = "row";
    var percentage = document.createElement("div");
    percentage.className = "progress";
    var percentageBar = document.createElement("div");
    percentageBar.className = "progress-bar bg-light-gray";
    percentageBar.setAttribute("role", "progressbar");
    var levelPercentage = 0;
    if(classData.levelExpToGo != 0) {
        levelPercentage = Math.round((classData.levelExp / (classData.levelExp + classData.levelExpToGo)) * 100);
        level.className = "col-1 level";
    } else {
        level.className = "col-1 levelMax";
    }
    percentageBar.setAttribute("aria-valuenow", levelPercentage);
    percentageBar.setAttribute("aria-valuemin", 0);
    percentageBar.setAttribute("aria-valuemax", 100);
    percentageBar.innerText = `${levelPercentage}%`;
    percentageBar.style = `width: ${levelPercentage}%`;
    percentage.appendChild(percentageBar);
    percentageDiv.appendChild(percentage);

    var jobName = document.createElement("div");
    jobName.className = "row jobName";
    jobName.innerText = classData.name;

    classNamePercent.appendChild(jobName)
    classNamePercent.appendChild(percentageDiv)
    
    row.appendChild(classNamePercent);

    return row;    
}

const populateTableThingyIDontKnowWhatImDoing = async function(data) {
    if (data) {
        let container = document.getElementById("jobList");
        let containterGrid = document.createElement("div");
        containterGrid.className = "row";
        let tankCol = document.createElement("div")
        tankCol.className = "col jobType";
        let dpsCol = document.createElement("div")
        dpsCol.className = "col jobType";
        for (let i = 0, len = data.jobs.length; i < len; i++) {
            var row = createRow(data.jobs[i]);
            if(data.jobs[i].tank) {
                tankCol.appendChild(row);
            } else if(data.jobs[i].meleeDps) {
                dpsCol.appendChild(row);
            } else {
                tankCol.appendChild(row);
            }
        }

        containterGrid.appendChild(tankCol)
        containterGrid.appendChild(dpsCol)
        container.appendChild(containterGrid)
    }

}

const getCharFromForm = async function () {
    let charName = document.getElementById("charName").value;
    let server = document.getElementById("server").value;
    let targetDate = new Date(document.getElementById("targetDate").value);
    console.log(targetDate);
    let lodestoneId = await searchCharacter(charName, server);
    if (lodestoneId) {
    let classJobs = await getCharacterInfo(lodestoneId);
    let data = await calculate(classJobs, targetDate);
    console.log(data);
    document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);
    document.getElementById('characterSearch').innerHTML = "";
    populateTableThingyIDontKnowWhatImDoing(await data);
    } else {

    }
}
    

const start = async function () {
    let lodestoneId = await searchCharacter();
    let classJobs = await getCharacterInfo(lodestoneId);
    let targetDate = new Date(2021, 10, 18);
    let data = await calculate(classJobs, targetDate);


}
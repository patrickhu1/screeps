var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleTransfer = require('role.transfer');
var roleReserver = require('role.reserver');
var roleClaimer = require('role.claimer');
var roleAttacker = require('role.attacker');
module.exports.loop = function () {
    // 内存清理
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    // 显示控制器剩余能量
    var roominfo = '';
    for (var name in Game.rooms) {
        roominfo = roominfo + ' Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy'
    }
    console.log(roominfo);

    // 塔修复和战斗
    for (var roomName in Game.rooms) {
        Game.rooms[roomName].find(FIND_STRUCTURES, {filter: (i) => i.structureType === STRUCTURE_TOWER}).forEach(function (tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            } else {
                var creeps = tower.room.find(FIND_MY_CREEPS, {filter: (i) => i.hits < i.hitsMax});
                creeps.sort((a, b) => a.hits - b.hits);
                if (creeps.length > 0) {
                    tower.heal(creeps[0]);
                } else {
                    var structures = tower.room.find(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 25000
                    });
                    structures.sort((a, b) => a.hits - b.hits);
                    if (structures.length > 0) {
                        tower.repair(structures[0]);
                    }
                }
            }
        })
    }


    // 显示各兵种数量
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' && creep.memory.room === 'W9N49');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' && creep.memory.room === 'W9N49');
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    var transfers = _.filter(Game.creeps, (creep) => creep.memory.role === 'transfer');
    var reservers = _.filter(Game.creeps, (creep) => creep.memory.role === 'reserver');
    var attackers = _.filter(Game.creeps, (creep) => creep.memory.role === 'attacker');
    console.log('W9N49: Harvesters: ' + harvesters.length + ';Upgraders: ' + upgraders.length + '; Builders: ' + builders.length + ';Transfers: ' + transfers.length + ';Reservers: ' + reservers.length + ';Attackers: ' + attackers.length);


    // // 保持宣称者数量
    reserveRoom = [];
    reservers.forEach((i) => reserveRoom.push(i.memory.roomName));
    ['W7N49', 'W8N49'].forEach(roomName => {
        if (Game.rooms[roomName].controller.reservation['ticksToEnd'] < 4000 && !reserveRoom.includes(roomName)) {
            var newName = 'Reserver' + Game.time;
            console.log('Spawning new reserver: ' + newName);
            Game.spawns['Spawn1'].spawnCreep([CLAIM, CLAIM, MOVE, MOVE], newName, {
                memory: {
                    role: 'reserver',
                    roomName: roomName
                },
                directions: [BOTTOM]
            });
        }
    });
    if (attackers.length < 1) {
        var newName = 'Attacker' + Game.time;
        console.log('Spawning new attacker: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE], newName,
            {
                memory: {role: 'attacker', room: 'W8N49'},
                directions: [BOTTOM]
            });
    }


    var upgraders2 = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader' && creep.memory.room === 'W6N49');
    var builders2 = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder' && creep.memory.room === 'W6N49');
    console.log('W6N49: Upgraders: ' + upgraders2.length + '; Builders: ' + builders2.length);
    if (upgraders2.length < 1) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawn2 Spawning new upgrader: ' + newName);
        Game.spawns['Spawn2'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY,CARRY, MOVE, MOVE], newName,
            {
                memory: {role: 'upgrader', room: 'W6N49'},
                directions: [BOTTOM]
            });
    }
    // 保持建设者数量
    if (builders2.length < 1) {
        var newName = 'Builder' + Game.time;
        console.log('Spawn1 Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
            {
                memory: {role: 'builder', room: 'W6N49'},
                directions: [BOTTOM]
            });
    }

    if (upgraders.length < 1) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawn1 Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], newName,
            {
                memory: {role: 'upgrader', room: 'W9N49'},
                directions: [BOTTOM]
            });
    }
    // 保持建设者数量
    if (builders.length < 1) {
        var newName = 'Builder' + Game.time;
        console.log('Spawn1 Spawning new builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
            {
                memory: {role: 'builder', room: 'W9N49'},
                directions: [BOTTOM]
            });
    }
    // 保持传递者数量
    var ownedContainers = [];
    transfers.forEach((i) => ownedContainers.push(i.memory.containerId));
    for (var i in Game.rooms) {
        Game.rooms[i].find(FIND_STRUCTURES, {
            //对有存储能量的容器生成transfer
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 100 &&
                ['W9N49', 'W8N49', 'W7N49'].includes(structure.room.name)
        }).forEach(function (container) {
            if (!ownedContainers.includes(container.id)) {
                //根据是否是比较近的房间区分生产模块
                if (['W9N49', 'W8N49'].includes(Game.getObjectById(container.id).room.name)) {
                    var spawnName = 'Spawn1';
                } else {
                    spawnName = 'Spawn2'
                }
                var newName = 'Transfer' + container.id;
                console.log(spawnName + 'Spawning new transfer: ' + newName);
                Game.spawns[spawnName].spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
                    {
                        memory: {role: 'transfer', containerId: container.id},
                        directions: [BOTTOM]
                    });
            }
        });
    }
    // 保持采集者数量
    var ownedSources = [];
    harvesters.forEach((i) => ownedSources.push(i.memory.sourceId));
    for (var roomName in Game.rooms) {
        Game.rooms[roomName].find(FIND_SOURCES, {
            filter: i => ['W9N49', 'W8N49', 'W7N49'].includes(i.room.name)
        }).forEach(function (source) {
            if (!ownedSources.includes(source.id)) {
                //根据是否是比较近的房间区分生产模块
                if (['W9N49', 'W8N49', 'W7N49'].includes(Game.getObjectById(source.id).room.name)) {
                    var spawnName = 'Spawn1'
                } else {
                    spawnName = 'Spawn2'
                }
                var newName = 'Harvester' + source.id;
                console.log(spawnName + 'Spawning new harvester: ' + newName);
                Game.spawns[spawnName].spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
                    {
                        memory: {role: 'harvester', sourceId: source.id},
                        directions: [BOTTOM]
                    });
            }
        })
    }


    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role === 'transfer') {
            roleTransfer.run(creep);
        }
        if (creep.memory.role === 'reserver') {
            roleReserver.run(creep);
        }
        if (creep.memory.role === 'claimer') {
            roleClaimer.run(creep);
        }
        if (creep.memory.role === 'attacker') {
            roleAttacker.run(creep);
        }
    }
};
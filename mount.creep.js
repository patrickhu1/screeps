// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
};

// 自定义的 Creep 的拓展
const creepExtension = {
    // 自定义敌人检测
    isEnemy() {
        return this.room.find(FIND_HOSTILE_CREEPS).length > 0
    },
    isFull() {
        return this.store.getFreeCapacity() === 0;
    },
    isEmpty() {
        return _.sum(this.store) === 0;
    },
    switch() {
        if (this.hits < this.hitsMax * 0.6) {
            this.moveTo(new RoomPosition(25, 25, this.memory.room))
        } else {
            if
            (this.memory.transfer && this.isEmpty()) {
                this.memory.transfer = false
            }
            if (!this.memory.transfer && this.isFull()) {
                this.memory.transfer = true
            }
        }
    },
    // 填充所有 spawn 和 extension
    fillSpawnEnergy() {
        var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        return this.fillTargetResource(target, RESOURCE_ENERGY)
    },
    // 填充所有 tower
    fillTower() {
        const tower = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) >= 500
        });
        return this.fillTargetResource(tower, RESOURCE_ENERGY)
    },
    //填充所属房间的storage
    fillStorage() {
        let storage;
        if (['W9N49', 'W8N49'].includes(this.room.name)) {
            storage = Game.rooms['W9N49'].storage;

        } else {
            storage = Game.rooms['W6N49'].storage;
        }
        return this.fillTargetAll(storage)
    },
    //填充所属房间的terminal
    fillTerminal() {
        let terminal;
        if (['W9N49', 'W8N49'].includes(this.room.name)) {
            terminal = Game.rooms['W9N49'].terminal;

        } else {
            terminal = Game.rooms['W6N49'].terminal;
        }
        return this.fillTargetAll(terminal)
    },
    fillFactory() {
        const factory = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: i => i.structureType === STRUCTURE_FACTORY});
        return this.fillTargetAll(factory)
    },
    fillTargetResource(target, resource) {
        if (target && this.store[resource] > 0) {
            if (this.transfer(target, resource) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return true
        }
        return false
    },
    fillTargetAll(target) {
        if (target) {
            for (let name in this.store) {
                if (this.transfer(target, name) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            return true
        }
        return false
    },
    fillClosestResource(structureType, resource) {
        const targets = this.pos.findInRange(FIND_STRUCTURES, 5, {
            // getCapacity('all')返回总容量
            filter: i => i.structureType === structureType && _.sum(i.store) < i.store.getCapacity(resource)
        });
        if (targets.length > 0) {
            if (resource === 'all') {
                return this.fillTargetAll(targets[0])
            } else {
                return this.fillTargetResource(targets[0], resource);
            }
        }
        return false
    },
    // 其他更多自定义拓展


    getEnergy() {
        // 收集掉落的能量>墓碑的能量>最近的容器>存储器
        if (!this.getDroppedResource()) {
            if (!this.getTombAll()) {
                if (!this.getContainerAndLinkEnergy()) {
                    this.getTargetResource(this.room.storage, RESOURCE_ENERGY)
                }
            }
        }
    },
    getDroppedResource() {
        const droppedResources = this.pos.findInRange(FIND_DROPPED_RESOURCES, 3);
        if (droppedResources.length > 0) {
            if (this.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE) {
                this.moveTo(droppedResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            return true
        }
        return false
    },
    getTargetResource(target, resource) {
        if (target && target.store[resource] > 0) {
            if (this.withdraw(target, resource) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return true
        }
        return false
    },
    getTargetAll(target) {
        if (target && _.sum(target.store) > 0) {
            for (let name in target.store) {
                if (this.withdraw(target, name) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            return true
        }
        return false
    },
    getTombAll() {
        const tombstones = this.pos.findInRange(FIND_TOMBSTONES, 3, {filter: i => _.sum(i.store) > 0});
        if (tombstones.length > 0) {
            const tombstone = tombstones[0];
            return this.getTargetAll(tombstone)
        }
        return false
    },
    getContainerAndLinkEnergy() {
        // 能量最多的容器
        const containers = this.room.find(FIND_STRUCTURES, {
            filter: (i) => ((i.structureType === STRUCTURE_CONTAINER || i.structureType === STRUCTURE_LINK) &&
                i.store[RESOURCE_ENERGY] > 500)
        });
        if (containers.length > 0) {
            containers.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
            return this.getTargetResource(containers[0], RESOURCE_ENERGY)
        }
        return false
    },
    getContainerIdAll() {
        const container = Game.getObjectById(this.memory.containerId);
        if (container && _.sum(container.store) >= 200) {
            return this.getTargetAll(container)
        }
        return false
    },
    repairClosest() {
        const towers = this.room.find(FIND_STRUCTURES, {filter: (i) => i.structureType === STRUCTURE_TOWER});
        if (towers.length > 0) {
            return false
        }
        const brokens = this.pos.findInRange(FIND_STRUCTURES, 3, {
            // 容器的生命上限
            filter: object => object.hits < object.hitsMax && object.hits < 250000
        });
        if (brokens.length > 0) {
            const result = this.repair(brokens[0]);
            if (result === ERR_NOT_IN_RANGE) {
                this.moveTo(brokens[0]);
                return true
            } else if (result === OK) {
                return true
            }
        }
        return false
    },
    buildClosest() {
        const target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (target) {
            if (this.build(target) === ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            return true
        }
        return false
    },
    harvestSource() {
        const source = Game.getObjectById(this.memory.sourceId);
        if (this.harvest(source) === ERR_NOT_IN_RANGE || this.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
            this.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },
    attackClosest() {
        const target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            if (this.attack(target) === ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }
            return true
        }
        return false
    }
};

// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}

// 自定义的 Creep 的拓展
const creepExtension = {
    // 自定义敌人检测
    checkEnemy() {
        // 代码实现...
    },
    // 填充所有 spawn 和 extension
    fillSpawnEngry() {
        // 代码实现...
    },
    // 填充所有 tower
    fillTower() {
        // 代码实现...
    },
    // 其他更多自定义拓展
    isFull() {
        if (!this._isFull) {
            this._isFull = _.sum(this.carry) === this.carryCapacity;
        }
        return this._isFull;
    },
    getEnergy() {
        // 收集掉落的能量>墓碑的能量>最近的容器>存储器
        var droppedResources = this.room.find(FIND_DROPPED_RESOURCES, {
            filter: i => i.resourceType === RESOURCE_ENERGY
        });
        if (droppedResources.length > 0) {
            if (this.pickup(droppedResources[0]) === ERR_NOT_IN_RANGE) {
                this.moveTo(droppedResources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            var tombstone = this.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (i) => i.store[RESOURCE_ENERGY] > 0
            });
            if (tombstone) {
                if (this.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    this.moveTo(tombstone, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                // 最近的容器
                var containers = this.room.find(FIND_STRUCTURES, {
                    filter: (i) => (i.structureType === STRUCTURE_CONTAINER &&
                        i.store[RESOURCE_ENERGY] > 500)
                });
                var container = containers.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])[0];
                //没有合适的容器，从储存器取
                if (!container) {
                    container = this.room.storage;
                }
                if (this.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
};

exports.up = function(knex, Promise) {
    knex.schema.createTable('task_queue', function(table) {
        table.increments('id');
        table.string('group_type', 1);
        table.string('title', 128);
    })
};

exports.down = function(knex, Promise) {
  
};

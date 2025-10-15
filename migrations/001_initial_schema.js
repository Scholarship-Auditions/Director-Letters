exports.up = pgm => {
  pgm.createTable('letterwriters', {
    writer_id: 'id',
    name: { type: 'varchar(255)', notNull: true },
  });
  pgm.createTable('letterrecipients', {
    recipient_id: 'id',
    name: { type: 'varchar(255)', notNull: true },
  });
  pgm.createTable('lettercategories', {
    category_id: 'id',
    name: { type: 'varchar(255)', notNull: true },
  });
  pgm.createTable('letters', {
    letter_id: 'id',
    title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text' },
    writer_id: {
      type: 'integer',
      notNull: true,
      references: '"letterwriters"',
      onDelete: 'cascade',
    },
    recipient_id: {
      type: 'integer',
      notNull: true,
      references: '"letterrecipients"',
      onDelete: 'cascade',
    },
    category_id: {
      type: 'integer',
      notNull: true,
      references: '"lettercategories"',
      onDelete: 'cascade',
    },
  });
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
  });

  // Insert sample data
  pgm.sql(`
    INSERT INTO letterwriters (name) VALUES ('Band Director'), ('Choir Director'), ('Orchestra Director'), ('Musical Theater Director');
    INSERT INTO letterrecipients (name) VALUES ('Student'), ('Parent'), ('Administrator'), ('Colleague');
    INSERT INTO lettercategories (name) VALUES ('Recommendation'), ('Congratulations'), ('Discipline'), ('General');
  `);
};

exports.down = pgm => {
  pgm.dropTable('users');
  pgm.dropTable('letters');
  pgm.dropTable('lettercategories');
  pgm.dropTable('letterrecipients');
  pgm.dropTable('letterwriters');
};
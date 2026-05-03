<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class Forms extends AbstractMigration
{
    /**
     * Change Method.
     *
     * Write your reversible migrations using this method.
     *
     * More information on writing migrations is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     *
     * Remember to call "create()" or "update()" and NOT "save()" when working
     * with the Table class.
     */
    public function change(): void
    {
        $this->table('FormResponses')
            ->addColumn('Form_ID', 'integer', ['null' => false])
            ->addColumn('User_ID', 'integer', ['null' => true])
            ->addColumn('Responded_At', 'datetime', ['null' => false, 'default' => 'CURRENT_TIMESTAMP'])
            ->addColumn('Data', 'json', ['null' => false])
            ->addIndex(['Form_ID', 'User_ID'], ['unique' => true])
            ->addIndex('User_ID')
            ->create();

        $this->table('Alerts')
            ->addColumn('Start_At', 'datetime', ['null' => false])
            ->addColumn('End_At', 'datetime', ['null' => false])
            ->addColumn('Content', 'text', ['null' => false])
            ->addColumn('Link', 'string', ['null' => true, 'limit' => 512])
            ->addColumn('Dismissable', 'boolean', ['null' => false, 'default' => true])
            ->create();
    }
}

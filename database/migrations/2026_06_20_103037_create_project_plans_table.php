<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('project_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('month'); // '2026-06'
            $table->integer('planned_velocity')->default(0); // плановая скорость
            $table->integer('planned_tasks')->default(0); // плановое количество задач
            $table->integer('planned_bugs')->default(0); // плановое количество багов
            $table->timestamps();
            
            $table->unique(['project_id', 'month']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('project_plans');
    }
};

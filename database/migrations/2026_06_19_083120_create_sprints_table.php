<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sprints', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Sprint 23"
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('story_points')->default(0); // сколько сделали
            $table->integer('tasks_completed')->default(0); // сколько задач закрыли
            $table->integer('tasks_total')->default(0); // всего задач в спринте
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sprints');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sprint_id')->nullable()->constrained()->onDelete('set null');
            $table->string('key'); // "PROJ-123"
            $table->string('title');
            $table->integer('story_points')->nullable();
            $table->string('status'); // To Do, In Progress, Review, Done
            $table->timestamp('created_at_jira')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('releases', function (Blueprint $table) {
            $table->id();
            $table->string('version'); // "v2.3.0"
            $table->date('released_at');
            $table->integer('tasks_count')->default(0);
            $table->integer('post_release_bugs')->default(0); // сколько багов нашли после релиза
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('releases');
    }
};
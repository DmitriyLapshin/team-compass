<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectPlan;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectPlanController extends Controller
{
    public function index(Request $request)
    {
        $projectId = $request->get('project_id');
        
        $query = ProjectPlan::with('project');
        
        if ($projectId) {
            $query->where('project_id', $projectId);
        }
        
        return response()->json([
            'plans' => $query->orderBy('month')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,id',
            'month' => 'required|string|format:Y-m',
            'planned_velocity' => 'nullable|integer|min:0',
            'planned_tasks' => 'nullable|integer|min:0',
            'planned_bugs' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan = ProjectPlan::create($request->all());

        return response()->json([
            'message' => 'План создан',
            'plan' => $plan->load('project'),
        ], 201);
    }

    public function update(Request $request, ProjectPlan $plan)
    {
        $validator = Validator::make($request->all(), [
            'planned_velocity' => 'nullable|integer|min:0',
            'planned_tasks' => 'nullable|integer|min:0',
            'planned_bugs' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $plan->update($request->all());

        return response()->json([
            'message' => 'План обновлён',
            'plan' => $plan->load('project'),
        ]);
    }

    public function destroy(ProjectPlan $plan)
    {
        $plan->delete();

        return response()->json([
            'message' => 'План удалён',
        ]);
    }
}

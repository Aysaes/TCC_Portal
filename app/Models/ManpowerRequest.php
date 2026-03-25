<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpParser\Node\Expr\Cast;

class ManpowerRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'branch_id', 'department_id', 'position_id', 
        'is_budgeted', 'unbudgeted_purpose', 'headcount', 'date_needed',
        'educational_background', 'years_experience', 'skills_required',
        'employment_status', 'reliever_info', 'purpose', 
        'is_new_position', 'job_description', 'is_replacement', 'replaced_employee_name', 
        'poc_name', 'requesting_manager_id',
        'manager_approval_status', 'hr_approval_status', 'director_approval_status', 'status',
        'workflow_path', 'current_step'
    ];

    protected $casts = [
        'workflow_path' => 'array'
    ];

    // Relationships
    public function requester() { return $this->belongsTo(User::class, 'user_id'); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function position() { return $this->belongsTo(Position::class); }
    public function requestingManager() { return $this->belongsTo(User::class, 'requesting_manager_id'); }
}

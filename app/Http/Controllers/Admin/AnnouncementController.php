<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Branch;
use App\Models\PriorityLevel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcement = Announcement::with('branches', 'priorityLevel')->latest()->get();

        $branches = Branch::all();

        $priorities = PriorityLevel::all();

        return Inertia::render('Admin/Announcements', [
            'announcements' => $announcement,
            'branches' => $branches,
            'priorities' => $priorities,
        ]);
    }

    public function store (Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255', 
            'author' => 'required|string|max:255', 
            'content' => 'required|string',
            'priority_level_id' => 'required|exists:priority_levels,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
        ]);

        $data = $request->only(['title', 'author', 'content', 'priority_level_id']);

        if($request->hasFile('image')){
            $data['image_path'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create($data);

        $announcement->branches()->attach($request->input('branch_ids'));

        return back()->with('success', 'Announcement posted successfully!');
    }

    public function update (Request $request, Announcement $announcement)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'content' => 'required|string',
            'priority_level_id' => 'required|exists:priority_levels,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
        ]);

        try{
            $data = $request->only(['title', 'author', 'content', 'priority_level_id']);

            if($request->hasFile('image')){
                if($announcement->image_path){
                    Storage::disk('public')->delete($announcement->image_path);
                }
                $data['image_path'] = $request->file('image')->store('announcements', 'public');
            }

            $announcement->update($data);

            $announcement->branches()->sync($request->input('branch_ids'));

            return back()->with('success', 'Announcement updated successfully!');
        }catch(\Exception $e){
            return back()->withErrors(['error' => 'Failed to update announcement: ' . $e->getMessage()]);
        }
    }

    public function destroy(Announcement $announcement)
    {
        try{
            if($announcement->image_path){
                Storage::disk('public')->delete($announcement->image_path);
            }

            $announcement->delete();

            return back()->with('success', 'Announcement deleted successfully.');
        }catch(\Exception $e){
            return back()->withErrors(['error' => 'Failed to delete announcement: ' . $e->getMessage()]);
        }
    }

    public function storePriority(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:priority_levels,name',
            'color' => 'required|string|max:7',
        ]);

        PriorityLevel::create($request->only(['name', 'color']));

        return back()->with('success', 'New priority level added!');
    }
}

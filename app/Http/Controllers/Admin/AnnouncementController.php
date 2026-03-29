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

   public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'content' => 'required|string',
            'priority_level_id' => 'required|exists:priority_levels,id',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
            
            // 🟢 Validate the Cover Photo (Images only, max 5MB)
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            
            // 🟢 Validate the Attachment (Documents only, max 10MB)
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
        ]);

        // Handle Cover Photo Upload
        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('announcements/images', 'public');
        }

        // Handle Document Attachment Upload
        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')->store('announcements/attachments', 'public');
        }

        $announcement = Announcement::create($validated);
        
        // Attach the branches via pivot table
        $announcement->branches()->sync($request->branch_ids);

        return back()->with('success', 'Announcement posted successfully.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'content' => 'required|string',
            'priority_level_id' => 'required|exists:priority_levels,id',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:10240',
        ]);

        // Handle Cover Photo Update
        if ($request->hasFile('image')) {
            // Delete the old image if it exists
            if ($announcement->image_path) {
                Storage::disk('public')->delete($announcement->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('announcements/images', 'public');
        }

        // Handle Document Attachment Update
        if ($request->hasFile('attachment')) {
            // Delete the old attachment if it exists
            if ($announcement->attachment_path) {
                Storage::disk('public')->delete($announcement->attachment_path);
            }
            $validated['attachment_path'] = $request->file('attachment')->store('announcements/attachments', 'public');
        }

        $announcement->update($validated);
        $announcement->branches()->sync($request->branch_ids);

        return back()->with('success', 'Announcement updated successfully.');
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

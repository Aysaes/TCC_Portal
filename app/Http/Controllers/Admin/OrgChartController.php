<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrgChartMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrgChartController extends Controller
{
    // For the Admin to manage members
    public function index()
    {
        $members = OrgChartMember::orderBy('sort_order')->latest()->get();
        
        // 👇 NEW: Check if the SVG exists and define the path
        $orgChartSvg = Storage::disk('public')->exists('org_chart/org-chart.svg') 
            ? 'storage/org_chart/org-chart.svg' 
            : null;

        return Inertia::render('Admin/OrgChart', [
            'members' => $members,
            'orgChartSvg' => $orgChartSvg // <-- Passed to React!
        ]);
    }

    // For the regular User to view the chart
    public function userIndex()
    {
        $members = OrgChartMember::orderBy('sort_order')->latest()->get();
        
        // 👇 NEW: Check if the SVG exists and define the path
        $orgChartSvg = Storage::disk('public')->exists('org_chart/org-chart.svg') 
            ? 'storage/org_chart/org-chart.svg' 
            : null;

        return Inertia::render('OrgChart', [
            'members' => $members,
            'orgChartSvg' => $orgChartSvg // <-- Passed to React!
        ]);
    }

    // 👇 NEW FUNCTION: Catch the SVG upload from the Admin Panel
    public function storeAsset(Request $request)
    {
        // Validate that it is actually a file and specifically an SVG
        $request->validate([
            'org_chart_file' => 'required|file|mimes:svg|max:768000', 
        ]);

        if ($request->hasFile('org_chart_file')) {
            // Save it with a fixed filename ('org-chart.svg') so it overwrites the old one automatically
            $request->file('org_chart_file')->storeAs('org_chart', 'org-chart.svg', 'public');
        }

        return back()->with('success', 'Organizational Chart updated successfully!');
    }

    // NEW FUNCTION: Save the Drag-and-Drop Order
    public function reorder(Request $request)
    {
        $request->validate([
            'orderedIds' => 'required|array',
        ]);

        foreach ($request->orderedIds as $index => $id) {
            OrgChartMember::where('id', $id)->update(['sort_order' => $index]);
        }

        return back();
    }

    // Store a new member
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'branch' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:768000',
        ]);

        $data = $request->only(['name', 'position', 'branch']); 

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('org_chart', 'public');
        }

        OrgChartMember::create($data);

        return back()->with('success', 'Member added to Organizational Chart successfully!');
    }

    // Save changes to an existing member (including photo replacement)
    public function update(Request $request, OrgChartMember $member)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'branch' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:768000', // Image optional on update
        ]);

        $data = $request->only(['name', 'position', 'branch']);

        // Handle photo replacement if a new one is uploaded
        if ($request->hasFile('image')) {
            // 1. Delete the old photo if it exists
            if ($member->image_path) {
                Storage::disk('public')->delete($member->image_path);
            }
            // 2. Store the new photo
            $data['image_path'] = $request->file('image')->store('org_chart', 'public');
        }

        $member->update($data);

        return back()->with('success', 'Member updated successfully.');
    }

    // Delete a member
    public function destroy(OrgChartMember $member)
    {
        if ($member->image_path) {
            Storage::disk('public')->delete($member->image_path);
        }
        
        $member->delete();

        return back()->with('success', 'Member removed successfully.');
    }
}
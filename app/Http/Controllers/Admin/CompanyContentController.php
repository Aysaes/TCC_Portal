<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\CompanyContent;
use App\Models\ContentType;

class CompanyContentController extends Controller
{
    public function index()
    {
        $contents = CompanyContent::all();
        $contentTypes = ContentType::all();

        return Inertia::render('Admin/CompanyContent', [
            'contents' => $contents,
            'contentTypes' => $contentTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|max:50', // Restrict to these two types for now
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // Max 2MB image
        ]);

        try {
            $data = $request->only(['type', 'title', 'content']);

            // Handle the image upload if one was provided
            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('company_contents', 'public');
            }

            CompanyContent::create($data);

            return back()->with('success', 'Content added successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to add content: ' . $e->getMessage());
        }
    }

    
    public function update(Request $request, CompanyContent $companyContent)
    {
        $request->validate([
            'type' => 'required|string|max:50',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            $data = $request->only(['type', 'title', 'content']);

            // If the admin uploaded a NEW image
            if ($request->hasFile('image')) {
                // Delete the old image from the server first to save space
                if ($companyContent->image_path) {
                    Storage::disk('public')->delete($companyContent->image_path);
                }
                // Store the new image
                $data['image_path'] = $request->file('image')->store('company_contents', 'public');
            }

            $companyContent->update($data);

            return back()->with('success', 'Content updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update content: ' . $e->getMessage());
        }
    }

    
    public function destroy(CompanyContent $companyContent)
    {
        try {
            // Delete the image file from the server
            if ($companyContent->image_path) {
                Storage::disk('public')->delete($companyContent->image_path);
            }

            // Delete the database row
            $companyContent->delete();

            return back()->with('success', 'Content deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete content: ' . $e->getMessage());
        }
    }

    public function storeType(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:content_types,name',
        ]);

        ContentType::create($request->only('name'));

        return back()->with('success', 'New content type added!');
    }
}


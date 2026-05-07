<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResourceLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResourceLinkController extends Controller
{
    public function index()
    {
        $links = ResourceLink::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/ResourceLinks', [
            'links' => $links
        ]);
    }

    // Save a new link
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'type' => 'required|in:internal,external',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('resource_links', 'public');
            $validated['image_path'] = $path;
        }

        // 🟢 Remove the raw file array so Laravel doesn't try to save it to DB
        unset($validated['image']);

        ResourceLink::create($validated);

        return redirect()->back()->with('success', 'Resource link added successfully.');
    }

    // Update an existing link
    public function update(Request $request, ResourceLink $resourceLink)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'description' => 'nullable|string',
            'type' => 'required|in:internal,external',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($resourceLink->image_path) {
                Storage::disk('public')->delete($resourceLink->image_path);
            }
            $path = $request->file('image')->store('resource_links', 'public');
            $validated['image_path'] = $path;
        }

        // 🟢 Remove the raw file array so Laravel doesn't try to save it to DB
        unset($validated['image']);

        $resourceLink->update($validated);

        return redirect()->back()->with('success', 'Resource link updated successfully.');
    }

    // Delete a link
    public function destroy(ResourceLink $resourceLink)
    {
        if ($resourceLink->image_path) {
            Storage::disk('public')->delete($resourceLink->image_path);
        }

        $resourceLink->delete();

        return redirect()->back()->with('success', 'Resource link deleted successfully.');
    }
}
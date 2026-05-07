<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResourceLink;
use Illuminate\Http\Request;
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
            'url' => 'required|url|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:internal,external',
            'is_active' => 'boolean',
        ]);

        ResourceLink::create($validated);

        return redirect()->back()->with('success', 'Resource link added successfully.');
    }

    // Update an existing link
    public function update(Request $request, ResourceLink $resourceLink)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:internal,external',
            'is_active' => 'boolean',
        ]);

        $resourceLink->update($validated);

        return redirect()->back()->with('success', 'Resource link updated successfully.');
    }

    // Delete a link
    public function destroy(ResourceLink $resourceLink)
    {
        $resourceLink->delete();

        return redirect()->back()->with('success', 'Resource link deleted successfully.');
    }
}

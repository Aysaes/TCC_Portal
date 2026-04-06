<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;
use App\Notifications\NewDocumentAlert;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $categories = DocumentCategory::all();
        $activeCategory = $request->query('category', 'Overview');

        $query = Document::query();

        if ($activeCategory !== 'Overview') {
            $query->where('category', $activeCategory);
        }

        $documents = $query->latest()->get();

        return Inertia::render('DocumentRepo', [
            'documents' => $documents,
            'categories' => $categories,
            'activeCategory' => $activeCategory,
        ]);
    }

   public function store(Request $request){
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            // The limit is set right here to 20480 kilobytes (20MB)
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:51200', 
        ]);

        $filePath = $request->file('file')->store('documents');

        try{
            // 🟢 1. Save the document to a variable so we can use its title
            $document = Document::create([
                'title' => $request->input('title'),
                'category' => $request->input('category'),
                'description' => $request->input('description'),
                'file_path' => $filePath,
            ]);

            // 🟢 2. Grab every active user in the system
            $allUsers = User::all();

            // 🟢 3. Send the in-app notification to everyone!
            if ($allUsers->isNotEmpty()) {
                Notification::send($allUsers, new NewDocumentAlert($document->title, Auth::user()->name));
            }

            return redirect()->back()->with('success', 'Document uploaded successfully.');
        }catch(\Exception $e){
            return redirect()->back()->with('error', 'Failed to upload document: ' . $e->getMessage());
        }   
    }

    public function destroy(Document $document)
    {
        try {
            if (Storage::disk('local')->exists($document->file_path)) {
                Storage::disk('local')->delete($document->file_path);
            } elseif (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return back()->with('success', 'Document deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete document: ' . $e->getMessage()]);
        }
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:document_categories,name',
        ]);

        DocumentCategory::create($request->only('name'));

        return back()->with('success', 'New document category added!');
    }

    // --- NEW FUNCTION: Delete a Category ---
    public function destroyCategory($id)
    {
        try {
            $category = DocumentCategory::findOrFail($id);

            // Safety Check: Prevent deleting categories that currently have documents assigned to them
            $documentCount = Document::where('category', $category->name)->count();
            
            if ($documentCount > 0) {
                return back()->with('error', 'Cannot delete this category because it contains ' . $documentCount . ' documents. Please move or delete the documents first.');
            }

            $category->delete();

            return back()->with('success', 'Category deleted successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete category: ' . $e->getMessage());
        }
    }

    public function show($id, $filename = null)
    {
        $document = Document::findOrFail($id);

        if (Storage::disk('local')->exists($document->file_path)) {
            $path = Storage::disk('local')->path($document->file_path);
        } 
        elseif (Storage::disk('public')->exists($document->file_path)) {
            $path = Storage::disk('public')->path($document->file_path);
        } 
        else {
            abort(404, 'Document file could not be found in the secure vault.');
        }

        $headers = [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $document->title . '.pdf"'
        ];
        return response()->file($path, $headers);
    }
}
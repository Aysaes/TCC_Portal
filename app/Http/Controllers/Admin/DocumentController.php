<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx|max:20480', // 20MB max
        ]);

        $filePath = $request->file('file')->store('documents');

        try{
            Document::create([
            'title' => $request->input('title'),
            'category' => $request->input('category'),
            'description' => $request->input('description'),
            'file_path' => $filePath,
        ]);

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

    public function show($id)
    {
        $document = Document::findOrFail($id);

        // 1. Check the secure 'local' (private) disk first
        if (Storage::disk('local')->exists($document->file_path)) {
            $path = Storage::disk('local')->path($document->file_path);
        } 
        // 2. Fallback: Check the 'public' disk just in case
        elseif (Storage::disk('public')->exists($document->file_path)) {
            $path = Storage::disk('public')->path($document->file_path);
        } 
        // 3. If it's truly gone, throw the 404
        else {
            abort(404, 'Document file could not be found in the secure vault.');
        }

        // 4. Securely stream the file directly to the browser
        return response()->file($path);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PRPOStatusController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $requests = PurchaseRequest::with([
            'user:id,name', 
            'cc_user:id,name',
            'purchaseOrders.supplier', 
            'purchaseOrders.items',    
            'items.product'
        ])
        ->where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                  ->orWhere('cc_user_id', $user->id);
        })
        ->latest()
        ->paginate(15);

        return Inertia::render('PRPO/StatusIndex', [
            'requests' => $requests
        ]);
    }
}
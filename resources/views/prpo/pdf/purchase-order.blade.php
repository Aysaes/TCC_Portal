<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $po->po_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; font-size: 13px; line-height: 1.4; margin: 0; padding: 20px; }
        .header-table { width: 100%; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .header-table td { vertical-align: bottom; }
        .company-title { font-size: 24px; font-weight: bold; color: #111827; margin: 0; }
        .doc-title { font-size: 28px; font-weight: bold; color: #4f46e5; text-align: right; margin: 0; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .info-table td { width: 50%; vertical-align: top; padding: 15px; border: 1px solid #e5e7eb; background: #f9fafb; border-radius: 5px; }
        .info-label { font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 3px; }
        .info-value { font-size: 14px; font-weight: bold; color: #111827; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background-color: #f3f4f6; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #d1d5db; }
        .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .totals-table { width: 300px; float: right; border-collapse: collapse; }
        .totals-table td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
        .grand-total { font-size: 18px; font-weight: bold; color: #111827; background-color: #f3f4f6; }
        
        .signatures { margin-top: 100px; width: 100%; clear: both; }
        .sig-block { width: 45%; display: inline-block; }
        .sig-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px; }
        .sig-name { font-weight: bold; font-size: 14px; }
        .sig-title { font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>

@php
        $imagePath = resource_path('js/Assets/tcc_logo.png');
        $logoData = '';
        if(file_exists($imagePath)) {
            $logoData = 'data:image/png;base64,' . base64_encode(file_get_contents($imagePath));
        }
@endphp

    <table class="header-table" style="width: 100%;">
        <tr>
            {{-- Logo Column --}}
            @if($logoData)
            <td style="width: 100px; vertical-align: middle;">
                <img src="{{ $logoData }}" alt="TCC Logo" style="width: 90px; height: auto; border-radius: 4px;">
            </td>
            @endif
            
            {{-- Company Name Column --}}
            @if($logoData)
                <td style="vertical-align: middle; padding-left: 15px;">
            @else
                <td style="vertical-align: middle; padding-left: 0;">
            @endif
                <h1 class="company-title" style="margin: 0; line-height: 1.2;">The CAT Clinic</h1>
                <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">Makati City, Metro Manila</div>
            </td>

            {{-- Document Title Column --}}
            <td style="vertical-align: middle; text-align: right;">
                <h2 class="doc-title" style="margin: 0;">PURCHASE ORDER</h2>
                <div style="font-weight: bold; margin-top: 5px;">PO #: {{ $po->po_number }}</div>
            </td>
        </tr>
    </table>

    <table class="info-table">
        <tr>
            <td>
                <span class="info-label">To Supplier:</span>
                <span class="info-value">{{ $po->supplier->name ?? 'N/A' }}</span><br>
                Contact: {{ $po->supplier->contact_person ?? 'N/A' }}<br>
                Phone: {{ $po->supplier->contact_number ?? 'N/A' }}<br>
                Address: {{ $po->supplier->address ?? 'N/A' }}<br>
                TIN: {{ $po->supplier->tin ?? 'N/A' }}
            </td>
            <td>
                <span class="info-label">Shipping Details:</span>
                <span class="info-value">Ship To: {{ $po->ship_to }}</span><br>
                Target Delivery: {{ \Carbon\Carbon::parse($po->delivery_date)->format('F d, Y') }}<br>
                Payment Terms: {{ $po->payment_terms }}<br>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 20%;">Notes / Freebies</th>
                <th class="text-center" style="width: 12%;">Quantity</th>
                <th class="text-right" style="width: 15%;">Unit Price</th>
                <th class="text-right" style="width: 18%;">Line Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($po->items as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>
                    <strong>{{ $item->product->name ?? $item->description }}</strong>
                    @if($item->specifications)
                        <br><span style="font-size: 11px; color: #6b7280;">{{ $item->specifications }}</span>
                    @endif
                </td>
                
                {{-- 🟢 NEW NOTES COLUMN --}}
                <td>
                    @if($item->notes)
                        <span style="font-size: 12px; color: #4f46e5; font-weight: bold;">{{ $item->notes }}</span>
                    @else
                        <span style="color: #9ca3af;">-</span>
                    @endif
                </td>

                <td class="text-center">{{ $item->qty }} {{ $item->unit }}</td>
                <td class="text-right">₱{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right font-bold">₱{{ number_format($item->net_payable, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals-table">
        <tr>
            <td>Gross Amount:</td>
            <td class="text-right">₱{{ number_format($po->gross_amount, 2) }}</td>
        </tr>
        <tr>
            <td>Discount:</td>
            <td class="text-right" style="color: #ef4444;">- ₱{{ number_format($po->discount_total, 2) }}</td>
        </tr>
        <tr>
            <td>Net of Discount:</td>
            <td class="text-right">₱{{ number_format($po->net_of_discount, 2) }}</td>
        </tr>
        <tr>
            <td>VAT:</td>
            <td class="text-right">₱{{ number_format($po->vat_total, 2) }}</td>
        </tr>
        <tr class="grand-total">
            <td>GRAND TOTAL:</td>
            <td class="text-right">₱{{ number_format($po->grand_total, 2) }}</td>
        </tr>
    </table>

    <div class="signatures">
        <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-name">{{ $po->preparedBy->name ?? 'Procurement Officer' }}</div>
            <div class="sig-title">Prepared By (Procurement)</div>
        </div>
        
        <div class="sig-block" style="float: right;">
            <div class="sig-line"></div>
            <div class="sig-name">Director of Corporate Services</div>
            <div class="sig-title">Approved By (DCSO)</div>
        </div>
    </div>

</body>
</html>
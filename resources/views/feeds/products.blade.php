<?php echo '<?xml version="1.0" encoding="UTF-8"?>'."\n"; ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>{{ __('site.brand') }}</title>
<link>{{ \App\Support\SiteUrl::home() }}</link>
<description>{{ $product->tagline }}</description>
@foreach ($items as $item)
<item>
<g:id>{{ $item['id'] }}</g:id>
<g:item_group_id>{{ $item['group'] }}</g:item_group_id>
<g:title>{{ $item['title'] }}</g:title>
<g:description>{{ $item['description'] }}</g:description>
<g:link>{{ $item['link'] }}</g:link>
@if ($item['image'])
<g:image_link>{{ $item['image'] }}</g:image_link>
@endif
@foreach ($item['additional_images'] as $image)
<g:additional_image_link>{{ $image }}</g:additional_image_link>
@endforeach
<g:availability>{{ $item['availability'] }}</g:availability>
<g:price>{{ $item['price'] }}</g:price>
<g:condition>new</g:condition>
<g:brand>Sattr</g:brand>
<g:identifier_exists>no</g:identifier_exists>
<g:pattern>{{ $item['pattern'] }}</g:pattern>
<g:google_product_category>Office Supplies &gt; General Office Supplies &gt; Paper Products &gt; Notebooks &amp; Notepads</g:google_product_category>
@if ($channel === 'google')
<g:shipping>
<g:country>EG</g:country>
<g:price>0.00 EGP</g:price>
</g:shipping>
@else
<g:quantity_to_sell_on_facebook>{{ $item['quantity'] }}</g:quantity_to_sell_on_facebook>
@endif
</item>
@endforeach
</channel>
</rss>

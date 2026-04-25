CREATE OR REPLACE FUNCTION public.is_order_buyer(_order_id uuid, _buyer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = _order_id
      AND buyer_id = _buyer_id
  );
$$;

CREATE OR REPLACE FUNCTION public.order_has_seller_listing(_order_id uuid, _seller_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.listings l ON l.id = oi.listing_id
    WHERE oi.order_id = _order_id
      AND l.seller_id = _seller_id
  );
$$;

DROP POLICY IF EXISTS "Sellers view orders w/ their listings" ON public.orders;
DROP POLICY IF EXISTS "Buyers view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Sellers view items of their listings" ON public.order_items;
DROP POLICY IF EXISTS "Buyers create order items" ON public.order_items;

CREATE POLICY "Sellers view orders with their listings"
ON public.orders
FOR SELECT
TO authenticated
USING (public.order_has_seller_listing(id, auth.uid()));

CREATE POLICY "Buyers view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (public.is_order_buyer(order_id, auth.uid()));

CREATE POLICY "Sellers view items of their listings"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.id = order_items.listing_id
      AND l.seller_id = auth.uid()
  )
);

CREATE POLICY "Buyers create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (public.is_order_buyer(order_id, auth.uid()));
-- Pact 0005: hide places that should never have been suggested (auction houses tagged as gardens, garden centres,
-- landscapers and so on). Safe to run more than once. Re-running the importer later does the same job properly.
update public.places
set active = false
where source = 'overture' and active = true and (
  name ~* '\m(auctions?|auctioneers?|bidding|ebay|garden cent(re|er)s?|landscap[a-z]*|nurser(y|ies)|funeral|crematorium|cemetery|storage|estate agents?|pawn[a-z]*|wholesale|scaffolding|plumbing|recruitment)\M'
  or tags[1] ~* '(auction|landscap|nursery|garden_furniture|greenhouse|funeral|cemetery|storage|real_estate|car_dealer|automotive|pawn|wholesale|warehouse|office|printing|laundry|dentist|salon|insurance|bank|church|mosque|temple)'
  or (kind = 'garden' and coalesce(tags[1], '') !~* '(garden|botanical|arboretum)')
  or (kind = 'park' and coalesce(tags[1], '') !~* '(park|playground|recreation|green|common)')
);

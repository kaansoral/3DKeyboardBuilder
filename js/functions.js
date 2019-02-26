function is_object(o)
{ try{
	return o!==null && typeof o==='object';
} catch(e){} return false; }
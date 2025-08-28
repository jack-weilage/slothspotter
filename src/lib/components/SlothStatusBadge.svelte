<script lang="ts">
	import { SlothStatus } from "$lib/client/db/schema";
	import { Badge } from "$lib/components/ui/badge";

	let { status }: { status: SlothStatus } = $props();
</script>

<Badge variant={status === SlothStatus.Active ? "active" : "inactive"}>
	{status === SlothStatus.Active ? "Active" : "Removed"}
</Badge>

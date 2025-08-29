import maplibre from "maplibre-gl";

export function resetEventListener(
	evented: maplibre.Evented | undefined,
	event: string,
	listener: maplibre.Listener | undefined,
): () => void {
	if (listener) {
		evented?.on(event, listener);
	}

	const prevListener = listener;
	return () => {
		if (prevListener) {
			evented?.off(event, prevListener);
		}
	};
}

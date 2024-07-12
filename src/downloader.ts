import { App, requestUrl } from "obsidian";

interface DownloadParams {
	url: string;
	path: string; // path the file is being downloaded to
	contentType: string;
}

export async function downloadFile(
	app: App,
	params: DownloadParams
): Promise<void> {
	try {
		const response = await requestUrl({
			url: params.url,
			method: "GET",
			contentType: params.contentType,
		});

		const body = await response.arrayBuffer;
		await app.vault.createBinary(params.path, body);
	} catch (e) {
		throw new Error(e);
	}
}

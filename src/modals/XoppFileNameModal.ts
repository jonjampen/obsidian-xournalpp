import {
	App,
	ButtonComponent,
	Editor,
	Modal,
	TextComponent,
	DropdownComponent,
} from "obsidian";

export default class XoppFileNameModal extends Modal {
	editor: Editor | null;
	createFile: (fileName: string, templatePath: string) => void;
	createAndOpenFile: (fileName: string, templatePath: string) => void;
	templates: { path: string; name: string }[];
	defaultTemplatePath?: string;

	constructor(
		app: App,
		createFile: (fileName: string, templatePath: string) => void,
		createAndOpenFile: (fileName: string, templatePath: string) => void,
		templates: { path: string; name: string }[],
		defaultTemplatePath?: string
	) {
		super(app);
		this.createFile = createFile;
		this.createAndOpenFile = createAndOpenFile;
		this.templates = templates;
		this.defaultTemplatePath = defaultTemplatePath;
	}

	onOpen() {
		const { contentEl } = this;

		const container = contentEl.createDiv({
			cls: "new-xopp-file-modal-form",
		});

		let fileName: string;
		let selectedTemplatePath = "";

		const defaultTemplateName = this.defaultTemplatePath
			? this.defaultTemplatePath.split("/").pop()?.replace(".xopp", "")
			: undefined;

		const defaultTemplateLabel = defaultTemplateName
			? ` (Default: ${defaultTemplateName})`
			: " (Default template)";

		container.createEl("label", {
			text: `Select a template:`,
		});

		const dropdown = new DropdownComponent(container)
			.addOption("", defaultTemplateLabel)
			.onChange((value) => {
				selectedTemplatePath = value;
			});

		this.templates.forEach((t) => dropdown.addOption(t.path, t.name));

		dropdown.setValue("");
		selectedTemplatePath = "";

        container.createEl("label", {
			text: `Enter a file name:`,
		});

		const textComponent = new TextComponent(container)
			.setPlaceholder("my_note")
			.onChange((i) => {
				fileName = i;
			});

		textComponent.inputEl.focus();
		// Using a timeout to ensure the focus is set after the modal is fully rendered.
		setTimeout(() => textComponent.inputEl.focus(), 0);

		textComponent.inputEl.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				if (e.shiftKey) {
					this.createAndOpenFile(fileName, selectedTemplatePath);
					this.close();
				} else {
					this.createFile(fileName, selectedTemplatePath);
					this.close();
				}
			}
		});

		const buttonRow = container.createDiv({ cls: "button-row" });

		new ButtonComponent(buttonRow)
			.setButtonText("Create")
			.setTooltip("Enter")
			.onClick(() => {
				this.createFile(fileName, selectedTemplatePath);
				this.close();
			});

		new ButtonComponent(buttonRow)
			.setButtonText("Create & Open")
			.setTooltip("Shift + Enter")
			.onClick(() => {
				this.createAndOpenFile(fileName, selectedTemplatePath);
				this.close();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

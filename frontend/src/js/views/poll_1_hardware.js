import "../../css/views/poll_1_hardware.css";
import { D2 } from "../utils/d2";
import {OrderableData} from "../utils/orderable_data";
import {LoaderOverlay} from "../ui/loader-overlay";
import {Modal, ModalButton} from "../ui/overlay";
import {DoRequest} from "../utils/requests";
import {PushToast} from "../ui/toasts";

let categories = _categories;

export class HardwareList extends OrderableData {
    constructor(container, items = []) {
        super();
        container.appendChild(this.list);
        this.items = items;
        this.renderList();
    }

    render(item) {
        let dragHandle, removeBtn, input;

        const el = D2.Div("hardware-item", () => {
            dragHandle = D2.Div("drag-handle", "☰");
            input = D2.Input(item.value || "Type here!", "text", item.value || "");
            input.addEventListener("input", () => {
                item.value = input.value;
                this.update(item.Id, item);
            });
            removeBtn = D2.Div("remove-btn", "×");
            removeBtn.addEventListener("click", () => this.remove(item.Id));
        });

        el._dragHandle = dragHandle;
        el.setAttribute("data-id", item.Id);
        return el;
    }
}

if (document.getElementById("form-controls")) {
    let form = document.getElementById("form-controls");

    for (let category in categories) {
        if (categories[category].show === false) continue;
        let cat = D2.Div("form-category", () => {
            D2.Text("h1", categories[category].title);
            if(categories[category].note) D2.Text("p", categories[category].note, "note")
            D2.Div("form-category-items", () => {
                for (let item in categories[category].categories) {
                    let itemData = categories[category].categories[item];
                    itemData.responses = [];
                    itemData.notes = "";

                    D2.Div("form-item", () => {
                        let addBtn;
                        D2.Div("toolbar", () => {
                            D2.Text("h2", itemData.title);
                            addBtn = D2.Button("+", "secondary small");
                        })
                        D2.Div("form-item-options", () => {
                            let listContainer = D2.Div("form-item-options-list");
                            let hardwareList = new HardwareList(listContainer, []);

                            hardwareList.change = () => {
                                itemData.responses = hardwareList.items.map(i => i.value);
                            };

                            addBtn.addEventListener("click", () => {
                                hardwareList.add({ value: "" });
                            });
                            hardwareList.add({ value: "" }); // now fires change correctly
                        });
                        D2.Div("form-item-notes", () => {
                            D2.Div("input-with-text", () => {
                                let area = D2.TextArea("Anything extra to mention?");
                                area.addEventListener("input", () => {
                                    itemData.notes = area.value;
                                });
                                area.setAttribute("rows", 1);
                            });
                        });
                    });
                }
            });
        });
        form.appendChild(cat);
    }

    document.getElementById("submit-button").addEventListener("click", () => {
        let modal = new Modal("You sure?", "Are you sure you've filled out everything correctly?", [
            new ModalButton("Yes!", async () => {
                modal.close();
                let loader = new LoaderOverlay("Submitting...");
                let resp = await DoRequest("POST", "/poll/1", {categories});
                loader.overlay.remove();
                if(resp.success == true) {

                    location.reload();
                } else {
                    PushToast({"theme": "warning", "content": resp.message});
                }
            }),
            new ModalButton("Hold up", () => {
                modal.close();
            })
        ])
    })
}
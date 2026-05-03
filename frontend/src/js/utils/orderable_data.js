import * as DOM from "./dom";

export class OrderableData {
    items = [];
    list = null;

    constructor() {
        this.list = DOM.Div("div", "orderablelist-outer");
    }

    change() {}

    // Add new item and set its Order
    add(item) {
        item.Id = this.getNextID(item.Id);
        this.items.push(item);

        this._updateOrder();
        this.renderList();
        this.change();
        return item;
    }

    // Remove item by Id
    remove(ID) {
        this.items = this.items.filter(item => item.Id !== ID);
        this._updateOrder();
        this.renderList();
        this.change();
    }

    // Update an item
    update(ID, data) {
        const item = this.items.find(item => item.Id === ID);
        if (item) {
            Object.assign(item, data);
            this._updateOrder();
        } else console.warn(`Item with ID ${ID} not found.`);
        this.change();
    }

    // Move item up/down
    move(ID, direction) {
        const index = this.items.findIndex(item => item.Id === ID);
        if (index === -1) return;

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.items.length) return;

        const listChildren = Array.from(this.list.children);
        const currentEl = listChildren[index];
        const targetEl = listChildren[newIndex];

        // get current positions
        const currentRect = currentEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // animate swap
        currentEl.style.transition = "transform 0.2s";
        targetEl.style.transition = "transform 0.2s";

        currentEl.style.transform = `translateY(${targetRect.top - currentRect.top}px)`;
        targetEl.style.transform = `translateY(${currentRect.top - targetRect.top}px)`;

        // after animation, actually swap elements
        setTimeout(() => {
            currentEl.style.transition = "";
            targetEl.style.transition = "";
            currentEl.style.transform = "";
            targetEl.style.transform = "";

            [this.items[index], this.items[newIndex]] = [this.items[newIndex], this.items[index]];

            this._updateOrder();
            this.renderList();
            this.change();
        }, 200);
    }

    // Get next unique Id
    getNextID(i) {
        if (typeof i !== "undefined") return i;
        let highestID = 0;
        for (let it of this.items) {
            const ID = parseInt(it.Id);
            if (ID > highestID) highestID = ID;
        }
        return highestID + 1;
    }

    // Internal method to sync Order field
    _updateOrder() {
        this.items.forEach((item, index) => item.Order = index);
    }

    renderList() {
        if (!this.list) return;
        this.list.innerHTML = "";

        let draggedItem = null;
        let draggedIndex = -1;
        let draggedClone = null;
        let placeholder = null;
        let offsetX = 0;
        let offsetY = 0;

        const onMouseMove = e => {
            if (!draggedClone) return;

            draggedClone.style.top = `${e.clientY - offsetY}px`;

            const children = Array.from(this.list.children);
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child === placeholder || child === draggedClone) continue;

                const rect = child.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const draggedCenter = e.clientY - offsetY + draggedClone.offsetHeight / 2;

                if (draggedCenter < midpoint) {
                    if (placeholder.parentNode !== this.list || children.indexOf(placeholder) !== i) {
                        this.list.insertBefore(placeholder, child);
                    }
                    break;
                }

                if (i === children.length - 1) {
                    if (placeholder.parentNode !== this.list || children.indexOf(placeholder) !== children.length) {
                        this.list.appendChild(placeholder);
                    }
                }
            }
        };

        const onMouseUp = () => {
            if (!draggedClone || draggedIndex === -1) return;

            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            draggedClone.remove();
            if (placeholder && this.list.contains(placeholder)) {
                const newIndex = Array.from(this.list.children).indexOf(placeholder);
                this.items.splice(draggedIndex, 1);
                this.items.splice(newIndex, 0, draggedItem);

                this._updateOrder();
                this.renderList();
                this.change();
            }
        };

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const el = this.render(item);
            this.list.appendChild(el);
            el.classList.add("draggable-element");

            const handle = el._dragHandle;
            if (!handle) continue;

            handle.style.cursor = "grab";

            handle.addEventListener("mousedown", e => {
                e.preventDefault();
                draggedItem = item;
                draggedIndex = i;

                const rect = el.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                draggedClone = el.cloneNode(true);
                draggedClone.classList.add("dragged-clone");
                draggedClone.style.setProperty("--drag-width", `${el.offsetWidth}px`);
                draggedClone.style.setProperty("--drag-height", `${el.offsetHeight}px`);
                draggedClone.style.top = `${e.clientY - offsetY}px`;
                draggedClone.style.left = `${e.clientX - offsetX}px`;

                document.body.appendChild(draggedClone);

                placeholder = document.createElement("div");
                placeholder.className = "drag-placeholder";
                placeholder.style.setProperty("--placeholder-height", `${el.offsetHeight}px`);
                this.list.insertBefore(placeholder, el);
                this.list.removeChild(el);

                onMouseMove(e);
                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        }
    }

    render(item) {
        // override in subclass
    }
}

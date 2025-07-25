import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { type FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import type { ApiKey } from './api-key.interface';

@Component({
  selector: 'app-edit-key-modal',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  template: `
    <p-dialog header="Edit API Key" [(visible)]="visible" [modal]="true" (onHide)="onClose.emit()">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-group">
          <label class="form-label" for="editKeyName">Key Name</label>
          <input type="text" id="editKeyName" class="form-input" formControlName="name" />
        </div>
        <div class="form-group">
          <label class="form-label">API Key</label>
          <div class="api-key-key" style="padding: 12px; background-color: #11111b; border: 1px solid #45475a; border-radius: 6px;">
            {{ key?.key }}
          </div>
        </div>
        <div class="btn-group">
          <p-button type="submit" label="Save Changes" styleClass="p-button-primary" [disabled]="form.invalid"></p-button>
          <p-button type="button" label="Cancel" styleClass="p-button-secondary" (click)="onClose.emit()"></p-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditKeyModalComponent {
  @Input() set key(key: ApiKey | null) {
    this._key = key;
    if (key) {
      this.form.patchValue({ name: key.name });
    }
  }
  get key(): ApiKey | null {
    return this._key;
  }
  @Output() edit = new EventEmitter<{ id: string; name: string }>();
  @Output() onClose = new EventEmitter<void>();

  visible = true;
  private _key: ApiKey | null = null;

  form: ReturnType<typeof this.createForm>;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.valid && this.key) {
      this.edit.emit({ id: this.key.id, name: this.form.value.name! });
    }
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { type FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-create-key-modal',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  template: `
    <p-dialog header="Create New API Key" [(visible)]="visible" [modal]="true" (onHide)="onClose.emit()">
      <!-- Manual Option -->
      <div class="option-section">
        <div class="option-header">
          <div class="option-title">Manual Key Input</div>
        </div>
        <div class="modal-section-desc">
          Enter an existing GitHub Copilot API key manually if you already have one.
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label" for="keyName">Key Name</label>
            <input type="text" id="keyName" class="form-input" placeholder="e.g., Production Client" formControlName="name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="apiKey">GitHub Copilot API Key</label>
            <input type="password" id="apiKey" class="form-input" placeholder="ghu_xxxxxxxxxxxxxxxxxxxx" formControlName="key" />
          </div>
          <div class="btn-group">
            <p-button type="submit" label="Add API Key" styleClass="p-button-success" [disabled]="form.invalid"></p-button>
            <p-button type="button" label="Cancel" styleClass="p-button-secondary" (click)="onClose.emit()"></p-button>
          </div>
        </form>
      </div>
    </p-dialog>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateKeyModalComponent {
  @Output() create = new EventEmitter<{ name: string; key: string }>();
  @Output() onClose = new EventEmitter<void>();

  visible = true;

  form: ReturnType<typeof this.createForm>;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  private createForm() {
    return this.fb.group({
      name: ['', Validators.required],
      key: ['', [Validators.required, Validators.pattern(/^ghu_.+$/)]],
    });
  }

  submit() {
    if (this.form.valid) {
      const { name, key } = this.form.getRawValue();
      if (name && key) {
        this.create.emit({ name, key });
      }
    }
  }
}

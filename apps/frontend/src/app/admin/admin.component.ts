import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import type { ApiKey } from './api-key.interface';
import { ApiKeyService } from './api-key.service';
import { ApiKeysTableComponent } from './api-keys-table.component';
import { CreateKeyModalComponent } from './create-key-modal.component';
import { EditKeyModalComponent } from './edit-key-modal.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [HeaderComponent, ApiKeysTableComponent, CreateKeyModalComponent, EditKeyModalComponent, ButtonModule],
  template: `
    <app-header></app-header>
    <main class="main-content">
      <section class="data-section">
        <div class="table-header">
          <h1 class="section-header">API Keys Management</h1>
          <div class="table-actions">
            <p-button label="Create New Key" styleClass="p-button-primary" (click)="showCreateModal.set(true)"></p-button>
          </div>
        </div>
        <app-api-keys-table
          [keys]="apiKeys()"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)"
          (setDefault)="onSetDefault($event)"
        ></app-api-keys-table>
      </section>
    </main>

    @if (showCreateModal()) {
      <app-create-key-modal
        (create)="onCreate($event)"
        (onClose)="showCreateModal.set(false)"
      ></app-create-key-modal>
    }

    @if (showEditModal()) {
      <app-edit-key-modal
        [key]="selectedKey()"
        (edit)="onSaveChanges($event)"
        (onClose)="showEditModal.set(false)"
      ></app-edit-key-modal>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private apiKeyService = inject(ApiKeyService);

  apiKeys = this.apiKeyService.keys$;
  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedKey = signal<ApiKey | null>(null);

  onEdit(key: ApiKey) {
    this.selectedKey.set(key);
    this.showEditModal.set(true);
  }

  onDelete(id: string) {
    this.apiKeyService.deleteKey(id);
  }

  onSetDefault(id: string) {
    this.apiKeyService.setDefault(id);
  }

  onCreate(key: { name: string; key: string }) {
    this.apiKeyService.addKey(key);
    this.showCreateModal.set(false);
  }

  onSaveChanges(key: { id: string; name: string }) {
    this.apiKeyService.updateKey(key.id, key.name);
    this.showEditModal.set(false);
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import type { ApiKey } from './api-key.interface';

@Component({
  selector: 'app-api-keys-table',
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule],
  template: `
    <div class="table-container">
      <p-table [value]="keys" [tableStyle]="{ 'min-width': '50rem' }">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Usage</th>
            <th>Default</th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-key>
          <tr>
            <td>{{ key.name }}</td>
            <td>
              <span class="api-key-key">{{ key.key }}</span>
            </td>
            <td>{{ key.createdAt }}</td>
            <td>{{ key.lastUsedAt }}</td>
            <td>{{ key.usage }}</td>
            <td>
              @if (key.isDefault) {
                <p-tag styleClass="default-indicator" severity="warning" value="Default"></p-tag>
              } @else {
                <p-button label="Set Default" styleClass="p-button-sm p-button-warning" (click)="setDefault.emit(key.id)"></p-button>
              }
            </td>
            <td>
              <div class="api-key-actions">
                <p-button icon="pi pi-pencil" styleClass="p-button-sm p-button-secondary" (click)="edit.emit(key)"></p-button>
                <p-button icon="pi pi-trash" styleClass="p-button-sm p-button-danger" (click)="delete.emit(key.id)"></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .api-key-key {
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        color: #89b4fa;
        font-size: 11px;
      }
      .api-key-actions {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiKeysTableComponent {
  @Input() keys: ApiKey[] = [];
  @Output() edit = new EventEmitter<ApiKey>();
  @Output() delete = new EventEmitter<string>();
  @Output() setDefault = new EventEmitter<string>();
}

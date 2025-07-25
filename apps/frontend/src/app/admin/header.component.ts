import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <h1 class="app-title">Copilot Proxy</h1>
    </header>
  `,
  styles: [
    `
      .header {
        background-color: #181825;
        padding: 30px 40px;
        border-bottom: 1px solid #45475a;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      .app-title {
        font-size: 24px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #89b4fa;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}

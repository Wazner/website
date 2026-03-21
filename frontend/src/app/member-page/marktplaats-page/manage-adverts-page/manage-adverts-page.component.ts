import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AppTitleService } from 'src/app/services/app-title.service';
import { SelectionMap, SelectionType } from 'src/app/services/selection';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

interface Advert {
  id: number;
  title: string;
  category: number;
  expires_at: string;
  user_name?: string;
}

@Component({
  selector: 'app-manage-adverts-page',
  templateUrl: './manage-adverts-page.component.html',
  styleUrls: ['./manage-adverts-page.component.scss']
})
export class ManageAdvertsPageComponent implements OnInit {
  adverts: Advert[] = [];
  totalCount = 0;
  pageIndex = 0;
  pageSize = 50;
  selection = new SelectionMap<number>();
  loading = false;
  adminMode = false;
  isMarktplaatsAdmin = false;

  get columnsToDisplay() {
    const cols = ['select', 'title', 'category', 'expires_at'];
    if (this.adminMode) cols.push('user_name');
    return cols;
  }

  constructor(
    private httpClient: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    authService: AuthenticationService,
    titleService: AppTitleService
  ) {
    titleService.setTitle("Advertenties beheren - Ledenportaal");
    const user = authService.getCurrentUser();
    this.isMarktplaatsAdmin = user?.role_marktplaats_administrator ?? false;
  }

  ngOnInit(): void {
    this.loadAdverts();
  }

  onAdminModeChange() {
    this.selection.clear();
    this.pageIndex = 0;
    this.loadAdverts();
  }

  loadAdverts() {
    this.loading = true;
    let params = new HttpParams()
      .set('$page', this.pageIndex.toString())
      .set('$pageSize', this.pageSize.toString());
    if (this.adminMode) {
      params = params.set('$admin', 'true');
    } else {
      params = params.set('$mine', 'true');
    }

    this.httpClient.get<any>('/api/adverts', { params })
      .subscribe(result => {
        this.adverts = result.rows;
        this.totalCount = result.totalCount;
        this.pageIndex = result.pageIndex;
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  onPage(ev: PageEvent) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.loadAdverts();
  }

  onExtendClick() {
    this.httpClient.post('/api/adverts/extend', {
      type: this.selection.type === SelectionType.Including ? 'including' : 'excluding',
      items: Array.from(this.selection.items),
      admin: this.adminMode
    }).subscribe(() => {
      this.selection.clear();
      this.loadAdverts();
    });
  }

  isExpired(advert: Advert): boolean {
    return new Date(advert.expires_at) < new Date();
  }

  onEditClick() {
    const id = this.selection.items.values().next().value;
    this.router.navigate(['..', id, 'bewerken'], { relativeTo: this.route });
  }

  onDeleteClick() {
    const dialog = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        entityName: 'Advertenties',
        selection: this.selection
      }
    });

    dialog.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.httpClient.request('delete', '/api/adverts', {
        body: {
          type: this.selection.type === SelectionType.Including ? 'including' : 'excluding',
          items: Array.from(this.selection.items),
          admin: this.adminMode
        }
      }).subscribe(() => {
        this.selection.clear();
        this.loadAdverts();
      });
    });
  }

  getCategoryName(category: number): string {
    switch (category) {
      case 0: return 'Dieren';
      case 1: return 'Vlees';
      case 2: return 'Vacht';
      default: return '';
    }
  }
}

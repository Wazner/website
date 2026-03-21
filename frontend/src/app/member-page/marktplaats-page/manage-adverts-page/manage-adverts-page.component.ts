import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AppTitleService } from 'src/app/services/app-title.service';
import { SelectionMap, SelectionType } from 'src/app/services/selection';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { PageEvent } from '@angular/material/paginator';

interface Advert {
  id: number;
  title: string;
  category: number;
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
  columnsToDisplay = ['select', 'title', 'category'];
  selection = new SelectionMap<number>();
  loading = false;

  constructor(
    private httpClient: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    titleService: AppTitleService
  ) {
    titleService.setTitle("Advertenties beheren - Ledenportaal");
  }

  ngOnInit(): void {
    this.loadAdverts();
  }

  loadAdverts() {
    this.loading = true;
    const params = new HttpParams()
      .set('$page', this.pageIndex.toString())
      .set('$pageSize', this.pageSize.toString())
      .set('$mine', 'true');

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
          items: Array.from(this.selection.items)
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

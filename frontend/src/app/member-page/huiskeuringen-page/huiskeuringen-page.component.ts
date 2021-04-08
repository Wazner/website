import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableDataSource, TableDataSourceFactory } from 'src/app/services/table-data-source.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from 'src/app/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { SelectionMap, SelectionType } from 'src/app/services/selection';
import { filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import preferredDates from './dates';
import { IntlDatePipe } from 'src/app/intl-date.pipe';

interface Huiskeuring {
  id: number,
  year: number,
  preference_date: Date,
  date_sent: Date
}

@Component({
  selector: 'app-huiskeuringen-page',
  templateUrl: './huiskeuringen-page.component.html',
  styleUrls: ['./huiskeuringen-page.component.scss']
})
export class HuiskeuringenPageComponent {
  huiskeuringen: TableDataSource<Huiskeuring>;
  columnsToDisplay = ['select', 'year', 'preferred_date', 'date_sent'];
  selection = new SelectionMap<number>();

  lastSearchTimer: number | null = null;
  pendingSearch = "";

  constructor(
    private dataSourceFactory: TableDataSourceFactory,
    private httpClient: HttpClient, 
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private intlDatePipe: IntlDatePipe) {

    this.huiskeuringen = dataSourceFactory.create("/api/huiskeuringen", f => {
      f.date_sent = new Date(f.date_sent);
      return f;
    });
  }

  onAddClick() {
    this.router.navigate(["toevoegen"], { relativeTo: this.route });
  }

  onUpdateClick() {
    const key = this.selection.items.values().next().value;
    this.router.navigate([key], { relativeTo: this.route });
  }

  onDoubleClick(id: number) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  onPage(ev: PageEvent) {
    this.huiskeuringen.pageIndex = ev.pageIndex;
    this.huiskeuringen.pageSize = ev.pageSize;
  }

  getPreferredDate(region: number, preferredDate: number) {
    if(region === -1) {
      return "Afwijkend";
    }
    else if(preferredDate === -1) {
      return "Geen voorkeur";
    }

    return this.intlDatePipe.transform(preferredDates[region][preferredDate]);
  }
}

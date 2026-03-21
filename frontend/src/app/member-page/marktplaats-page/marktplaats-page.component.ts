import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTitleService } from 'src/app/services/app-title.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

interface Advert {
  id: number;
  title: string;
  body: string;
  category: number;
  first_photo_id: number | null;
}

@Component({
  selector: 'app-marktplaats-page',
  templateUrl: './marktplaats-page.component.html',
  styleUrls: ['./marktplaats-page.component.scss']
})
export class MarktplaatsPageComponent implements OnInit, OnDestroy {
  adverts: Advert[] = [];
  totalCount = 0;
  pageIndex = 0;
  pageSize = 12;
  loading = false;

  categoryControl = new FormControl('');
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    titleService: AppTitleService) {

    titleService.setTitle("Marktplaats - Ledenportaal");
  }

  ngOnInit(): void {
    this.categoryControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadAdverts();
      });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadAdverts();
      });

    this.loadAdverts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdverts() {
    this.loading = true;
    let params = new HttpParams()
      .set('$page', this.pageIndex.toString())
      .set('$pageSize', this.pageSize.toString());

    const category = this.categoryControl.value;
    if (category) {
      params = params.set('$category', category);
    }

    const search = this.searchControl.value;
    if (search) {
      params = params.set('$filter', search);
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

  onAddClick() {
    this.router.navigate(["toevoegen"], { relativeTo: this.route });
  }

  onManageClick() {
    this.router.navigate(["beheren"], { relativeTo: this.route });
  }

  onAdvertClick(id: number) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  getCategoryName(category: number): string {
    switch (category) {
      case 0: return 'Dieren';
      case 1: return 'Vlees';
      case 2: return 'Vacht';
      default: return '';
    }
  }

  getPhotoUrl(advertId: number, photoId: number): string {
    return `/api/adverts/${advertId}/photos/${photoId}`;
  }
}

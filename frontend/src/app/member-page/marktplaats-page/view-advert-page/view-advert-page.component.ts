import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppTitleService } from 'src/app/services/app-title.service';
import { GalleryItem, ImageItem } from 'ng-gallery';

interface Advert {
  id: number;
  title: string;
  body: string;
  category: number;
  is_mine: boolean;
  photos: { id: number }[];
}

@Component({
  selector: 'app-view-advert-page',
  templateUrl: './view-advert-page.component.html',
  styleUrls: ['./view-advert-page.component.scss']
})
export class ViewAdvertPageComponent implements OnInit {
  advert: Advert | null = null;
  notFound = false;
  galleryItems: GalleryItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient,
    titleService: AppTitleService
  ) {
    titleService.setTitle("Advertentie - Ledenportaal");
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.httpClient.get<any>(`/api/adverts/${id}`)
      .subscribe(result => {
        if (result.success) {
          this.advert = result.advert;
          this.galleryItems = result.advert.photos.map((p: { id: number }) => {
            const url = `/api/adverts/${result.advert.id}/photos/${p.id}`;
            return new ImageItem({ src: url, thumb: url });
          });
        } else {
          this.notFound = true;
        }
      }, () => {
        this.notFound = true;
      });
  }

  onBackClick() {
    this.router.navigate(['..'], { relativeTo: this.route });
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

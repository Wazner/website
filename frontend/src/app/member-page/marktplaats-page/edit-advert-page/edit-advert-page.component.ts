import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTitleService } from 'src/app/services/app-title.service';
import { AdvertForm } from '../add-advert-page/add-advert-page.component';

type AdvertCategory = 0 | 1 | 2;

interface GetAdvertResult {
  success: boolean;
  advert?: {
    id: number;
    title: string;
    body: string;
    category: number;
    photos: { id: number }[];
  };
}

@Component({
  selector: 'app-edit-advert-page',
  templateUrl: './edit-advert-page.component.html',
  styleUrls: ['./edit-advert-page.component.scss']
})
export class EditAdvertPageComponent implements OnInit {
  id: number = 0;
  loading = true;
  loadErrorMessage: string | null = null;
  errorMessage: string | null = null;

  formGroup = new FormGroup<AdvertForm>({
    category: new FormControl<AdvertCategory>(0, [Validators.required]),
    title: new FormControl<string>('', [Validators.required]),
    body: new FormControl<string>('', [Validators.required])
  });

  existingPhotos: { id: number }[] = [];
  deletedPhotoIds: number[] = [];
  newPhotos: File[] = [];

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    titleService: AppTitleService
  ) {
    titleService.setTitle("Advertentie bewerken - Ledenportaal");
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = Number(idParam);
    this.formGroup.disable();

    this.httpClient.get<GetAdvertResult>(`/api/adverts/${this.id}`)
      .subscribe(result => {
        this.loading = false;
        if (result.success && result.advert) {
          this.formGroup.setValue({
            category: result.advert.category as AdvertCategory,
            title: result.advert.title,
            body: result.advert.body
          });
          this.existingPhotos = result.advert.photos.slice();
          this.formGroup.enable();
        } else {
          this.loadErrorMessage = "De advertentie kon niet worden gevonden.";
        }
      }, () => {
        this.loading = false;
        this.loadErrorMessage = "De advertentie kon niet worden opgehaald.";
      });
  }

  getExistingPhotoUrl(photoId: number): string {
    return `/api/adverts/${this.id}/photos/${photoId}`;
  }

  onDeleteExistingPhotoClick(photoId: number) {
    this.existingPhotos = this.existingPhotos.filter(p => p.id !== photoId);
    this.deletedPhotoIds.push(photoId);
  }

  onAddPhotoClick() {
    this.fileInput.nativeElement.click();
  }

  onFileInputChange() {
    const files = this.fileInput.nativeElement.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.newPhotos.push(files[i]);
      }
      this.fileInput.nativeElement.value = "";
    }
  }

  onDeleteNewPhotoClick(index: number) {
    this.newPhotos.splice(index, 1);
  }

  onSubmit(ev: Event) {
    ev.preventDefault();

    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append("category", this.formGroup.value.category?.toString()!);
    formData.append("title", this.formGroup.value.title!);
    formData.append("body", this.formGroup.value.body!);
    for (const photoId of this.deletedPhotoIds) {
      formData.append("deleted_photo_ids[]", photoId.toString());
    }
    for (let i = 0; i < this.newPhotos.length; i++) {
      formData.append("photos[]", this.newPhotos[i], this.newPhotos[i].name);
    }

    this.httpClient.post<{ success: boolean }>(`/api/adverts/${this.id}`, formData)
      .subscribe(() => {
        this.router.navigate(["marktplaats", "beheren"], { relativeTo: this.route.parent });
        this.snackBar.open("Advertentie is bijgewerkt", undefined, { duration: 5000 });
      }, () => {
        this.errorMessage = "Er is een fout opgetreden bij het opslaan, probeer het later opnieuw.";
      });
  }

  onCancelClick() {
    this.router.navigate(["marktplaats", "beheren"], { relativeTo: this.route.parent });
  }
}

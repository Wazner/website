import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Form, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTitleService } from 'src/app/services/app-title.service';

interface AddResult {
  success: boolean,
  id?: number,
  reason?: "UNKNOWN"
}

type AdvertCategory = 0 | 1 | 2;

export interface AdvertForm {
  category: FormControl<AdvertCategory | null>,
  title: FormControl<string | null>,
  body: FormControl<string | null>
}

@Component({
  selector: 'app-add-advert-page',
  templateUrl: './add-advert-page.component.html',
  styleUrls: ['./add-advert-page.component.scss']
})
export class AddAdvertPageComponent {
  formGroup = new FormGroup<AdvertForm>({
    category: new FormControl<AdvertCategory>(0, [
      Validators.required
    ]),
    title: new FormControl<string>('', [
      Validators.required
    ]),
    body: new FormControl<string>('', [
      Validators.required
    ])
  })
  errorMessage: string | null = null;
  photos: File[] = [];
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private snackBar: MatSnackBar,
    titleService: AppTitleService
  ) { 

    titleService.setTitle("Advertentie plaatsen - Ledenportaal");
  }

  onSubmit(ev: Event) {
    ev.preventDefault();

    if(!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append("category", this.formGroup.value.category?.toString()!);
    formData.append("title", this.formGroup.value.title!);
    formData.append("body", this.formGroup.value.body!);
    for(let i = 0; i < this.photos.length; i++) {
      formData.append("photos[]", this.photos[i], this.photos[i].name);
    }

    this.httpClient.post<AddResult>("/api/adverts", formData)
      .subscribe((result) => {
        if(result.success) {
          this.router.navigate([".."], { relativeTo: this.route });
          this.snackBar.open("Advertentie is geplaatst", "Openen", {
            duration: 5000
          })
            .onAction()
            .subscribe(() => {
              this.router.navigate(["..", result.id], { relativeTo: this.route })
            });
        }
      }, (e) => {
        this.errorMessage = "Er is een fout opgetreden bij het toevoegen, probeer het later opnieuw.";
      });
  }
  
  onAddPhotoClick() {
    this.fileInput.nativeElement.click();
  }

  onFileInputChange() {
    const files = this.fileInput.nativeElement.files;
    if(files && files.length > 0) {
      for(let i = 0; i < files.length; i++) {
        this.photos.push(files[i]);
      }
      this.fileInput.nativeElement.value = "";
    }
  }

  onDeletePhotoClick(index: number) {
    this.photos.splice(index, 1);
  }

  onCancelClick() {
    this.router.navigate([".."], {
      relativeTo: this.route
    });
  }
}

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appFilePreview]'
})
export class FilePreviewDirective implements OnInit {
  @Input("appFilePreview") file!: File;

  constructor(private el: ElementRef<HTMLImageElement>) { }

  ngOnInit(): void {
    const reader = new FileReader();
    reader.addEventListener("load", (ev) => {
      this.el.nativeElement.src = ev.target?.result as string;
    });
    reader.readAsDataURL(this.file);
  }
}

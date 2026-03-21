import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appFilePreview]'
})
export class FilePreviewDirective implements OnInit {
  @Input("appFilePreview") file!: File;

  constructor(private el: ElementRef<HTMLImageElement>) { }

  ngOnInit(): void {
    this.el.nativeElement.src = URL.createObjectURL(this.file);
  }
}

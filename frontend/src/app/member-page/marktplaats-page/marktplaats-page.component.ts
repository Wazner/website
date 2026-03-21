import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppTitleService } from 'src/app/services/app-title.service';

@Component({
  selector: 'app-marktplaats-page',
  templateUrl: './marktplaats-page.component.html',
  styleUrls: ['./marktplaats-page.component.scss']
})
export class MarktplaatsPageComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    titleService: AppTitleService) {

    titleService.setTitle("Marktplaats - Ledenportaal");
  }

  ngOnInit(): void {
  }

  onAddClick() {
    this.router.navigate(["toevoegen"], { relativeTo: this.route });
  }
}

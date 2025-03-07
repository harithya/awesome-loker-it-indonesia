import {writeFile} from 'fs';
import {join} from 'path';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {fetchData} from './utils/fetch';
import {salaryFormat} from './utils/salaryFormat';
import {TemplateInterface} from './types/common';
import {locations} from './const';

const table = data => {
  return Object.keys(data)
    .map(key => {
      const logo =
        data[key]['companyMeta']['logoUrl'] !== ''
          ? data[key]['companyMeta']['logoUrl']
          : 'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101027/112815900-stock-vector-no-image-available-icon-flat-vector.jpg?ver=6';
      return (
        '|![logo-perusahaan](' +
        logo +
        ')|' +
        data[key]['companyMeta']['name'] +
        '|' +
        data[key]['jobTitle'] +
        '|' +
        data[key]['employmentTypes'][0]['name'] +
        '|' +
        salaryFormat(data[key]['salaryRange']['min']) +
        '-' +
        salaryFormat(data[key]['salaryRange']['max']) +
        '|' +
        data[key]['locations'][0]['name'] +
        '|' +
        data[key]['description'] +
        '|' +
        dayjs(data[key]['postedAt']).locale('id').format('dddd, DD MMMM YYYY') +
        '|' +
        data[key]['jobUrl'] +
        '|\n'
      );
    })
    .join('');
};

const template = ({data, location}: TemplateInterface) => {
  const region: string =
    location.split('-').join(' ').charAt(0).toUpperCase() +
    location.slice(1).replace('-', ' ');
  const template = `
  # Lowongan kerja di ${region}

  ### Diperbarui pada tanggal ${dayjs()
    .locale('id')
    .format('dddd, DD MMMM YYYY')}

  Berikut merupakan daftar lowongan kerja yang ada di ${region}

  |Logo Perusahaan | Nama Perusahaan | Judul Pekerjaan | Jenis Pekerjaan | Gaji Pekerjaan | Lokasi | Deskripsi | Tanggal diunggah | Pranala |
  | -------------- | --------------- | --------------- | --------- | --------- | -------------- | ------- | ----------- | ----------- |
  ${table(data)}

  [Kembali ke daftar lowongan kerja 🔙](../README.md#daftar-lowongan-kerja)
  `;

  return template;
};

const createMarkdown = async () => {
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    console.log(`Sedang memproses lowongan kerja ${location}`);
    const openingFile = join(__dirname, '..', 'loker/', `loker-${location}.md`);
    const data = await fetchData(location);
    writeFile(openingFile, template({data, location}), err => {
      if (err) console.error(err);
    });
    console.log(`Selesai memproses lowongan kerja ${location}`);
  }
};

createMarkdown();

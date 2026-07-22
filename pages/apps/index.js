import Head from 'next/head'
import AppListing from '../../components/AppListing'

// /apps — same listing as the home page.
export default function Apps() {
  return (
    <>
      <Head>
        <title>Apps | All Video Player & Saver | QR Scanner Barcode Reader</title>
        <meta
          name="description"
          content="Official update portal for All Video Player & Saver and QR Scanner Barcode Reader."
        />
      </Head>
      <AppListing />
    </>
  )
}

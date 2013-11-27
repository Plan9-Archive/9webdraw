#include <u.h>
#include <libc.h>
#include <ctype.h>

/*Definition from /sys/src/9/port/latin1.c */

/*
 * The code makes two assumptions: strlen(ld) is 1 or 2; latintab[i].ld can be a
 * prefix of latintab[j].ld only when j<i.
 */
struct cvlist
{
	char	*ld;		/* must be seen before using this conversion */
	char	*si;		/* options for last input characters */
	Rune	*so;		/* the corresponding Rune for each si entry */
} latintab[] = {
#include "/sys/src/9/port/latin1.h"
	0,	0,		0
};

/* Do Javascript strings have the same escapes as C? */
void cprint(char *s){
	for(s; *s; ++s){
		switch(*s){
		case '\'':
		case '\"':
		case '\\':
			print("\\%c", *s);
			break;
		case '\t':
			print("\\t");
			break;
		default:
			print("%c", *s);
			break;
		}
	}
}

/* Assumes no dangerous characters in rune string. */
/* XXX Large characters will break with Javascript's use of UTF-16! */

void main(void){
	struct cvlist *l;

	print("var Composetab = {\n");

	for(l = latintab; l->ld; ++l){
		print("\t\"");
		cprint(l->ld);
		print("\": {from:\"");
		cprint(l->si);
		print("\", to:\"");
		print("%S", l->so);
		print("\"},\n");
	}

	print("};\n");

	exits("");
}
